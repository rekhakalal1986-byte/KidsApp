/* =====================================================================
   hub.js — connects a game to the homepage. Every game includes it:

     <script src="../../shared/hub.js" data-game="your-game-id"></script>

   It gives the game:
     • a floating 🏠 button back to the homepage
       (add data-home-button="off" to the tag to hide it and use Hub.goHome())
     • "Keep playing" on the homepage
     • Hub.save(key, value) / Hub.load(key, fallback) / Hub.clear()
       — progress saved per game, so games never overwrite each other
     • Hub.setting(key, fallback) — settings from games.js (see SETTINGS there)
     • Hub.track({ skill, level, item, correct, firstTry, hints, ms, error, data })
       — records one answer. Queued on this device and sent to the server
         (HUB.backend in games.js) in the background once a grown-up has
         connected the device on grownups.html. Games keep working offline.

   The homepage includes it too (no data-game): it then provides settings and
   sending queued answers, but no 🏠 button or "Keep playing".
   ===================================================================== */
(function () {
  var script = document.currentScript;
  var root = new URL("../", script.src).href; // hub.js lives in /shared/, so ../ is the homepage
  var m = location.pathname.match(/\/games\/([^\/]+)\//);
  var gameId = script.getAttribute("data-game") || (m && decodeURIComponent(m[1])) || null;
  var prefix = "game:" + gameId + ":";

  // Games need the settings in games.js. Load it right after this script
  // (before the game's own script runs) unless the page already has it.
  if (!window.GAMES) document.write('<script src="' + root + 'games.js"><\/script>');

  // A setting is looked up in this order, first match wins:
  //   1. saved on this device by a settings page (localStorage "hub:settings")
  //        { all: { key: value }, games: { "<game-id>": { key: value } } }
  //   2. the game's own `settings: { ... }` in games.js
  //   3. window.SETTINGS in games.js (applies to every game)
  //   4. the fallback passed in
  function has(o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); }
  function settingFor(id, key, fallback) {
    var local = null;
    try { local = JSON.parse(localStorage.getItem("hub:settings") || "null"); } catch (e) {}
    var localGame = local && local.games && local.games[id];
    if (has(localGame, key)) return localGame[key];
    if (has(local && local.all, key)) return local.all[key];
    var g = (window.GAMES || []).filter(function (x) { return x && x.id === id; })[0];
    if (has(g && g.settings, key)) return g.settings[key];
    if (has(window.SETTINGS, key)) return window.SETTINGS[key];
    return fallback;
  }

  window.Hub = {
    gameId: gameId,
    homeUrl: root,
    settingFor: settingFor,
    setting: function (key, fallback) { return settingFor(gameId, key, fallback); },
    save: function (key, value) {
      try { localStorage.setItem(prefix + key, JSON.stringify(value)); return true; } catch (e) { return false; }
    },
    load: function (key, fallback) {
      try {
        var v = localStorage.getItem(prefix + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    clear: function () {
      try {
        Object.keys(localStorage).forEach(function (k) { if (k.indexOf(prefix) === 0) localStorage.removeItem(k); });
      } catch (e) {}
    },
    goHome: function () { location.href = root; },
  };

  // ---- server sync -------------------------------------------------------
  // Answers go into a queue in localStorage ("hub:queue") and are posted to the
  // PocketBase `events` collection when this device is connected ("hub:auth").
  // Each answer has a qid, unique on the server, so a resend is stored once.
  var QUEUE = "hub:queue", AUTH = "hub:auth", MAX_QUEUE = 5000, DAY = 864e5;
  function getJSON(k, fallback) {
    try { var v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  }
  function setJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
  function backendUrl() { var b = window.HUB && window.HUB.backend; return b && b.url ? String(b.url).replace(/\/+$/, "") : ""; }

  var device = getJSON("hub:device", null);
  if (!device) { device = uid(); setJSON("hub:device", device); }
  var session = uid();

  function api(path, method, body, keepalive) {
    var url = backendUrl();
    if (!url || !window.fetch) return Promise.reject(new Error("No server set up"));
    var headers = { "Content-Type": "application/json" };
    var auth = getJSON(AUTH, null);
    if (auth && auth.token) headers.Authorization = auth.token;
    return fetch(url + path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined, keepalive: !!keepalive })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (r.ok) return j;
          var err = new Error(j.message || ("HTTP " + r.status)); err.status = r.status; err.data = j.data || {}; throw err;
        });
      });
  }

  function saveAuth(res) {
    setJSON(AUTH, { token: res.token, id: res.record.id, email: res.record.email, refreshedAt: Date.now() });
  }
  function markSignedOut() {
    var auth = getJSON(AUTH, null);
    if (auth) { auth.token = ""; auth.expired = true; setJSON(AUTH, auth); }
  }

  var flushing = false, flushTimer = null;
  function flush(keepalive) {
    var auth = getJSON(AUTH, null);
    if (flushing || !auth || !auth.token || !backendUrl()) return Promise.resolve(false);
    var batch = getJSON(QUEUE, []).slice(0, 50);
    if (!batch.length) return Promise.resolve(true);
    flushing = true;
    var done = {}, stopped = false, authCheck = false;
    function next(i) {
      if (i >= batch.length) return Promise.resolve();
      var rec = {}; for (var k in batch[i]) rec[k] = batch[i][k];
      rec.player = auth.id;
      return api("/api/collections/events/records", "POST", rec, keepalive).then(function () {
        done[batch[i].qid] = 1; return next(i + 1);
      }, function (err) {
        // 400 with field errors = duplicate qid or bad data: drop it. A 400 without field
        // errors means the create rule refused us (login no longer valid): keep it.
        if (err.status === 400 && Object.keys(err.data).length) { done[batch[i].qid] = 1; return next(i + 1); }
        if (err.status === 400 || err.status === 401 || err.status === 403) authCheck = true;
        stopped = true; // offline, server down or signed out: try again later
      });
    }
    return next(0).then(function () {
      setJSON(QUEUE, getJSON(QUEUE, []).filter(function (e) { return !done[e.qid]; }));
      if (Object.keys(done).length) setJSON("hub:lastSync", Date.now());
      flushing = false;
      if (authCheck) refresh(true);
      if (!stopped && getJSON(QUEUE, []).length) schedule(500);
      return !stopped;
    });
  }
  function schedule(ms) { clearTimeout(flushTimer); flushTimer = setTimeout(function () { flush(false); }, ms); }

  // Keep the login fresh: a refresh each day gives another 90 days. A refused
  // refresh (401) means the login is gone, so the grown-ups page asks to reconnect.
  function refresh(force) {
    var auth = getJSON(AUTH, null);
    if (!auth || !auth.token || (!force && Date.now() - (auth.refreshedAt || 0) < DAY)) return Promise.resolve();
    return api("/api/collections/users/auth-refresh", "POST").then(saveAuth, function (err) {
      if (err.status === 401 || err.status === 403) markSignedOut();
    });
  }

  Hub.track = function (e) {
    if (!e || !e.skill) return false;
    var q = getJSON(QUEUE, []);
    q.push({
      qid: uid(), game: e.game || gameId || "hub", skill: String(e.skill),
      level: e.level == null ? null : Math.round(e.level), item: e.item == null ? "" : String(e.item).slice(0, 120),
      correct: !!e.correct, firstTry: !!e.firstTry, hints: Math.max(0, Math.round(e.hints || 0)),
      ms: Math.max(0, Math.round(e.ms || 0)), error: e.error ? String(e.error).slice(0, 40) : "",
      session: session, device: device, at: new Date().toISOString(), data: e.data || null,
    });
    if (q.length > MAX_QUEUE) q = q.slice(q.length - MAX_QUEUE);
    setJSON(QUEUE, q);
    schedule(2000);
    return true;
  };
  Hub.connect = function (email, password) {
    return api("/api/collections/users/auth-with-password", "POST", { identity: email, password: password })
      .then(function (res) { saveAuth(res); return flush(false); });
  };
  Hub.disconnect = function () { try { localStorage.removeItem(AUTH); } catch (e) {} };
  Hub.sync = function () { return refresh().then(function () { return flush(false); }); };
  Hub.status = function () {
    var auth = getJSON(AUTH, null);
    return {
      server: backendUrl(), connected: !!(auth && auth.token), expired: !!(auth && auth.expired),
      email: auth && auth.email || "", queued: getJSON(QUEUE, []).length,
      lastSync: getJSON("hub:lastSync", null), device: device,
    };
  };

  setTimeout(function () { Hub.sync(); }, 1500);
  setInterval(function () { flush(false); }, 60000);
  window.addEventListener("online", function () { flush(false); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") flush(true); });

  if (!gameId) return; // homepage and grown-ups page: no 🏠 button or "Keep playing"

  try { localStorage.setItem("hub:lastPlayed", JSON.stringify({ id: gameId, at: Date.now() })); } catch (e) {}

  if (script.getAttribute("data-home-button") === "off") return;

  function addButton() {
    var css = document.createElement("style");
    css.textContent =
      ".hub-home{position:fixed;z-index:2147483000;" +
      "top:calc(env(safe-area-inset-top,0px) + 12px);left:calc(env(safe-area-inset-left,0px) + 12px);" +
      "width:60px;height:60px;border-radius:50%;display:grid;place-items:center;" +
      "background:#fff;border:3px solid #1E1B4B;box-shadow:0 4px 0 #1E1B4B;" +
      "font-size:28px;line-height:1;text-decoration:none;-webkit-tap-highlight-color:transparent}" +
      ".hub-home:active{transform:translateY(3px);box-shadow:0 1px 0 #1E1B4B}" +
      ".hub-home:focus-visible{outline:4px solid #FDE047;outline-offset:3px}";
    document.head.appendChild(css);
    var a = document.createElement("a");
    a.className = "hub-home";
    a.href = root;
    a.setAttribute("aria-label", "Back to all games");
    a.textContent = "🏠";
    document.body.appendChild(a);
  }
  if (document.body) addButton(); else document.addEventListener("DOMContentLoaded", addButton);
})();
