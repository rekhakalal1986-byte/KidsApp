# Anvesha's Learning World

A free home for all our learning games, hosted on GitHub Pages. The homepage reads a list of games from `games.js` and shows each one as a tile. Adding a game means adding one folder and one entry in that list — the homepage never needs editing.

## What's in this repo

```
/
├── index.html             Homepage (don't need to touch)
├── games.js               ★ The game list — edit this to add/hide games
├── manifest.webmanifest   Makes it installable on iPad/phone Home Screen
├── .nojekyll              Required (lets GitHub serve folders starting with _ )
├── assets/                App icons
├── shared/
│   └── hub.js             Included by every game: 🏠 button + saving progress
└── games/
    ├── _template/         Copy this to start a new game
    └── times-tables/      One folder per game, each with its own index.html
```

---

## Part 1 — One-time setup

1. **Create the repository.** On GitHub click **New repository**.
   - Name it `YOUR-USERNAME.github.io` → site lives at `https://YOUR-USERNAME.github.io`
   - Or any name, e.g. `learning` → site lives at `https://YOUR-USERNAME.github.io/learning/`
   - Set it to **Public** (GitHub Pages is free for public repos). Don't tick "Add a README".

2. **Upload the files.** Unzip this package, then either:
   - **Web:** in the new repo click **uploading an existing file**, drag in everything *inside* the unzipped folder (not the folder itself), then **Commit changes**.
     `.nojekyll` is a hidden file — on Mac press **Cmd + Shift + .** in Finder to see it so it gets dragged in too.
   - **Command line:**
     ```bash
     cd learning-hub
     git init && git add -A && git commit -m "Learning hub"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git
     git push -u origin main
     ```

3. **Turn on GitHub Pages.** Repo → **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: **main**, folder **/ (root)** → **Save**.

4. **Wait 1–2 minutes**, then open the site URL. The **Actions** tab shows a green tick when it's live.

5. **Install it on the iPad.** Open the site in Safari → **Share** → **Add to Home Screen**. It now opens full-screen like a real app, and saved progress is better protected (see Troubleshooting).

---

## Part 2 — Adding a new game (do this every time)

1. **Pick a game id** — lowercase with dashes, e.g. `spelling-bee`. It's the folder name and the web address.

2. **Make the folder.** Copy `games/_template` to `games/spelling-bee`. The game's first page must be called `index.html` (lowercase).

3. **Build the game** inside that folder. Keep this line near the bottom of `index.html` and set `data-game` to the game id:
   ```html
   <script src="../../shared/hub.js" data-game="spelling-bee"></script>
   ```

4. **Add it to the list.** Open `games.js` and paste a new block at the top of `GAMES`:
   ```js
   {
     id: "spelling-bee",
     title: "Spelling Bee",
     description: "Hear a word, then spell it.",
     emoji: "🐝",
     color: "#FDE68A",
     category: "Words",
     added: "2026-11-01",
     status: "ready",
   },
   ```
   Every block ends with `},` — the most common mistake is a missing comma or quote.

5. **Upload.**
   - **Web:** go into the `games` folder on GitHub → **Add file → Upload files** → drag in the new game folder → **Commit**. Then go back to the repo root, click `games.js` → ✏️ pencil → paste your block → **Commit changes**.
   - **Command line:** `git add -A && git commit -m "Add Spelling Bee" && git push`

6. **Check it.** Wait about a minute, refresh the homepage. The tile appears with a NEW sticker for 14 days.

### games.js fields

| Field | Required | What it does |
|---|---|---|
| `id` | yes | Folder name in `/games/`. Must match exactly. |
| `title` | yes | Big name on the tile. |
| `description` | yes | One short line about the game. |
| `emoji` | no | Tile icon (defaults to 🎮). |
| `color` | no | Tile colour as hex. Light colours look best; text colour adjusts automatically. |
| `category` | no | Groups games into filter buttons (Math, Logic, Words, …). Buttons appear once there are 2+ categories. |
| `added` | no | `YYYY-MM-DD`. Shows the NEW sticker for 14 days. |
| `status` | no | `"ready"` (playable), `"coming-soon"` (greyed out, not tappable), `"hidden"` (not shown). Defaults to ready. |
| `url` | no | Use instead of the `games/<id>/` folder when a game lives somewhere else (see below). |

---

## Rules every game follows

- **One folder, one `index.html`.** Everything the game needs (images, sounds, JS) lives inside its folder.
- **Relative paths only** — `img/star.png`, not `/img/star.png`. Leading slashes break when the site isn't at the domain root.
- **Include `shared/hub.js`.** It adds the 🏠 button and the "Keep playing" link on the homepage.
- **Save progress with `Hub.save` / `Hub.load`.** All games share one website, so they share one storage area. Hub keys everything by game id so games never overwrite each other's progress:
  ```js
  const stars = Hub.load("stars", 0);   // second value = default if nothing saved
  Hub.save("stars", stars + 1);
  Hub.clear();                          // "Start over" for this game only
  ```
  If a game uses its own localStorage or IndexedDB, give every key/database name the game id as a prefix (e.g. `times-tables:progress`).
- **Built for little fingers on an iPad:** keep the viewport meta tags from the template, buttons at least 60px tall, nothing that only works on mouse hover, and leave the top-left corner clear for the 🏠 button.
- **No passwords or API keys in any file.** The repo is public — anyone can read every file.

## Changing or removing a game

- **Update a game:** upload the changed files into its folder (GitHub replaces files with the same name).
- **Hide a game:** set `status: "hidden"` in `games.js`. The folder can stay.
- **Delete a game:** remove its block from `games.js`, then delete the folder.

## A game in its own repository (optional)

Bigger games can live in their own repo with Pages turned on. They're served from the same address (`YOUR-USERNAME.github.io/game-repo/`), so progress and "Keep playing" still work. In that game, load hub with the full address:
```html
<script src="https://YOUR-USERNAME.github.io/shared/hub.js" data-game="big-game"></script>
```
and in `games.js` add `url: "https://YOUR-USERNAME.github.io/big-game/"`. (Only works when this hub repo is the `YOUR-USERNAME.github.io` one.)

## Troubleshooting

| Problem | Fix |
|---|---|
| Tile opens a 404 page | Folder name doesn't match `id` exactly, or the file isn't named `index.html`. Names are case-sensitive. |
| Homepage is blank or shows no games | `games.js` has a typo. Open it on GitHub — a red squiggle often marks the spot. Check commas and quotes. |
| A folder starting with `_` gives 404 | `.nojekyll` is missing from the repo root. Upload it again. |
| Changes don't show up | GitHub Pages can take a few minutes and caches pages for up to 10 minutes. Refresh again; on the Home Screen app, swipe it closed and reopen. |
| Progress disappeared | Safari can clear saved data for websites not opened in 7 days, and Private browsing never keeps it. Using the Home Screen app avoids both. |
| Testing on your own computer | Open a terminal in this folder, run `python3 -m http.server 8000`, then visit `http://localhost:8000`. |
