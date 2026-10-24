// =====================================================================
//  GAME LIST  —  the only file you edit to put a game on the homepage.
//  Add one { ... } block per game, newest at the top. See README.md.
// =====================================================================

window.HUB = {
  title: "Anvesha's Learning World", // shown in the top bar and browser tab
  name: "Anvesha",                  // used in the greeting; set to "" to hide
  backend: {                        // progress server; connect a device on grownups.html
    url: "https://anvesha-learn.duckdns.org",
    email: "anvesha@learning.home", // pre-filled on the connect form (the password is never stored in files)
  },
};

// SETTINGS — apply to every game. To change one game only, add
// `settings: { ... }` to that game's block below, e.g. settings: { unlockAllLevels: false }
window.SETTINGS = {
  unlockAllLevels: true,   // every level/trail open, so she can jump to any of them
  voice: true,             // read instructions aloud (Web Speech); text always stays on screen
  speechRate: 0.9,         // speech speed, 0.7 (slow) to 1.1 (quick)
  soundEffects: true,      // chimes, clicks and pops
};

window.GAMES = [
  {
    id: "pet-puzzle-pals",
    title: "Pet Puzzle Pals",
    description: "Watch, remember and spot the rule with Pip the puppy.",
    emoji: "🐶",
    color: "#FDE2C8",
    category: "Logic",
    added: "2026-10-22",
    status: "ready",
    settings: {
      roundsPerSession: 2,     // rounds before the Bedtime screen (1–3)
      itemsPerRound: 8,        // 6, 8 or 10 items per round (memory/logic alternate)
      petBreak: true,          // short Pet Break between rounds
      memoryPace: "normal",    // "normal" (1.1 s per pet) or "slow" (1.6 s)
      memoryLevelOffset: 0,    // -1, 0 or +1 added to every memory size
      adaptiveMemory: true,    // memory items grow/shrink by 1 within a round
      allowReplay: false,      // 🔊 replay button on memory items before she answers
      petLabels: true,         // pet names under pets in Who Peeked / Hide and Seek
      showDemos: true,         // "Watch me" demo the first time she meets an activity
      crossOff: true,          // ✕ buttons to cross out cards in Who Am I?
    },
  },
  {
    id: "snow-kingdom-stories",
    title: "Snow Kingdom Stories",
    description: "Every word problem is a little story.",
    emoji: "❄️",
    color: "#BAE6FD",
    category: "Math",
    added: "2026-10-21",
    status: "ready",
  },
  {
    id: "times-tables",          // folder name inside /games/ (lowercase-with-dashes)
    title: "Times Tables",
    description: "Practise tables 1 to 10 and collect stars.",
    emoji: "✖️",
    color: "#F9A8D4",            // tile colour (light colours look best)
    category: "Math",            // Math, Logic, Words, ... (makes the filter buttons)
    added: "2026-10-12",         // YYYY-MM-DD — shows a NEW sticker for 14 days
    status: "ready",             // "ready" | "coming-soon" | "hidden"
  },
  {
    id: "word-builder",
    title: "Word Builder",
    description: "Build new words from letter tiles.",
    emoji: "🔤",
    color: "#FDE68A",
    category: "Words",
    added: "2026-10-12",
    status: "coming-soon",
  },
  {
    id: "pattern-puzzles",
    title: "Pattern Puzzles",
    description: "Spot what comes next.",
    emoji: "🧩",
    color: "#99F6E4",
    category: "Logic",
    added: "2026-10-12",
    status: "coming-soon",
  },
];
