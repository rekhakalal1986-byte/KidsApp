---
description: Add a new game to the hub (folder + games.js entry), test it, and offer to publish
argument-hint: <game name, or path to an existing HTML file> [short description]
---

Add a new game to this learning hub: $ARGUMENTS

Follow CLAUDE.md. Steps:

1. Work out the game id (lowercase-with-dashes) from the name. If an HTML file path was given, that file is the game; otherwise ask me what the game should do before building it.
2. Create `games/<id>/` — copy `games/_template/index.html` as the base, or move the given file in as `index.html`.
3. Make sure the game includes `<script src="../../shared/hub.js" data-game="<id>"></script>` before its own script, uses relative paths, and saves progress with `Hub.save/Hub.load` (or id-prefixed keys). Keep the template's viewport/apple meta tags.
4. Add an entry at the top of `window.GAMES` in `games.js` with today's date as `added`, a fitting emoji, a light tile colour, and an existing category if one fits. Show me the title, description, emoji and category you chose.
5. Validate `games.js` parses, serve the site locally, and check: tile appears, tile opens the game, 🏠 goes home, progress survives a reload, no console errors.
6. Summarise what changed, then ask whether to commit and push to publish.
