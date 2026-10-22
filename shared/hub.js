/* =====================================================================
   hub.js — connects a game to the homepage. Every game includes it:

     <script src="../../shared/hub.js" data-game="your-game-id"></script>

   It gives the game:
     • a floating 🏠 button back to the homepage
       (add data-home-button="off" to the tag to hide it and use Hub.goHome())
     • "Keep playing" on the homepage
     • Hub.save(key, value) / Hub.load(key, fallback) / Hub.clear()
       — progress saved per game, so games never overwrite each other
   ===================================================================== */
(function () {
  var script = document.currentScript;
  var root = new URL("../", script.src).href; // hub.js lives in /shared/, so ../ is the homepage
  var m = location.pathname.match(/\/games\/([^\/]+)\//);
  var gameId = script.getAttribute("data-game") || (m && decodeURIComponent(m[1])) || "unknown";
  var prefix = "game:" + gameId + ":";

  window.Hub = {
    gameId: gameId,
    homeUrl: root,
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

  try { localStorage.setItem("hub:lastPlayed", JSON.stringify({ id: gameId, at: Date.now() })); } catch (e) {}

  if (script.getAttribute("data-home-button") === "off") return;

  function addButton() {
    var css = document.createElement("style");
    css.textContent =
      ".hub-home{position:fixed;z-index:2147483000;" +
      "top:calc(env(safe-area-inset-top,0px) + 12px);left:calc(env(safe-area-inset-left,0px) + 12px);" +
      "width:54px;height:54px;border-radius:50%;display:grid;place-items:center;" +
      "background:#fff;border:3px solid #1E1B4B;box-shadow:0 4px 0 #1E1B4B;" +
      "font-size:26px;line-height:1;text-decoration:none;-webkit-tap-highlight-color:transparent}" +
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
