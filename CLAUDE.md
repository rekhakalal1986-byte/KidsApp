# Learning hub — notes for Claude Code

Static site on GitHub Pages: a homepage that lists free learning games for kids, plus one folder per game. Main player is an elementary-school kid on an iPad. No build step, no npm, no frameworks — plain HTML/CSS/JS that runs straight from the repo.

## Layout

- `index.html` — homepage. Renders tiles from `games.js`. Don't edit it to add a game.
- `games.js` — the game registry (`window.GAMES`) and site settings (`window.HUB`). Adding a game = adding one entry here, newest at the top.
- `shared/hub.js` — included by every game: 🏠 home button, "Keep playing" tracking, and `Hub.save / Hub.load / Hub.clear` (localStorage keys namespaced `game:<id>:`).
- `games/_template/index.html` — starting point for a new game.
- `games/<id>/index.html` — each game. `<id>` is lowercase-with-dashes and must equal the `id` in `games.js`.
- `.nojekyll` — must stay; without it GitHub Pages hides `_template`.
- `README.md` — the manual-upload guide for humans. Keep it in sync if conventions change.

## Rules for every game

- Self-contained in its own folder; entry file is `index.html`. A single-file HTML game is fine — put it in as `games/<id>/index.html`.
- Relative paths only (`img/star.png`, never `/img/star.png`). The site may be served from a subpath.
- Must include, before the game's own script:
  `<script src="../../shared/hub.js" data-game="<id>"></script>`
- Save progress with `Hub.save/Hub.load`. If a game needs its own localStorage keys or IndexedDB names, prefix them with the game id — all games share one origin.
- Keep the viewport/apple meta tags from the template. Touch targets ≥ 60px, no hover-only interactions, leave the top-left corner clear for the 🏠 button, respect `prefers-reduced-motion`.
- External resources only from reliable CDNs (Google Fonts, cdnjs) with a fallback; the game must still work if they fail.
- No API keys, passwords, or tokens anywhere — the repo is public. No personal details about the kids beyond what's already in `games.js`.

## games.js entry

```js
{ id: "spelling-bee", title: "Spelling Bee", description: "Hear a word, then spell it.",
  emoji: "🐝", color: "#FDE68A", category: "Words", added: "YYYY-MM-DD", status: "ready" },
```
`status`: `ready` | `coming-soon` | `hidden`. Use today's date for `added`. Prefer light tile colours. Reuse an existing category when one fits.

## Checking work

- Serve locally: `python3 -m http.server 8000`, open `http://localhost:8000`.
- After changes, confirm: homepage shows the tile, the tile opens the game, 🏠 returns home, progress survives a reload, no console errors. Check at iPad portrait size (820×1180).
- `node -e "require('vm').runInNewContext(require('fs').readFileSync('games.js','utf8'),{window:{}})"` catches syntax errors in `games.js`.

## Publishing

Pushing to `main` deploys via GitHub Pages (live in ~1–2 minutes). Commit with a plain message like `Add Spelling Bee`. Ask before pushing.
