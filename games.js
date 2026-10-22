// =====================================================================
//  GAME LIST  —  the only file you edit to put a game on the homepage.
//  Add one { ... } block per game, newest at the top. See README.md.
// =====================================================================

window.HUB = {
  title: "Anvesha's Learning World", // shown in the top bar and browser tab
  name: "Anvesha",                  // used in the greeting; set to "" to hide
};

window.GAMES = [
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
