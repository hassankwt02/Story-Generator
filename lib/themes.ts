export type ThemeId = "fantasy" | "comedy" | "scifi" | "horror";

export interface Theme {
  id: ThemeId;
  label: string;
  emoji: string;
  blurb: string;
  /** Tailwind classes for the selectable card accent. */
  accent: string;
  /** Extra instructions woven into the AI prompt for this theme. */
  guidance: string;
}

export const THEMES: Theme[] = [
  {
    id: "fantasy",
    label: "Fantasy",
    emoji: "🧚",
    blurb: "Magic, dragons & enchanted lands",
    accent: "from-purple-500/30 to-indigo-500/30 border-purple-400/50",
    guidance:
      "A whimsical fantasy adventure with gentle magic, friendly mythical creatures, and a touch of wonder. Keep the magic warm and reassuring.",
  },
  {
    id: "comedy",
    label: "Comedy",
    emoji: "🤡",
    blurb: "Silly, goofy & giggly fun",
    accent: "from-amber-400/30 to-orange-500/30 border-amber-300/50",
    guidance:
      "A light, silly comedy full of playful jokes, funny mishaps, and giggles. Keep the humor wholesome and easy for a child to follow.",
  },
  {
    id: "scifi",
    label: "Sci-Fi",
    emoji: "🚀",
    blurb: "Space, robots & cool inventions",
    accent: "from-cyan-400/30 to-blue-500/30 border-cyan-300/50",
    guidance:
      "A wondrous science-fiction adventure with friendly robots, rocket ships, and clever inventions. Keep the science fun and curiosity-sparking.",
  },
  {
    id: "horror",
    label: "Spooky",
    emoji: "👻",
    blurb: "Friendly-spooky, never scary",
    accent: "from-emerald-500/30 to-slate-600/30 border-emerald-400/50",
    guidance:
      "A friendly-spooky story with playful ghosts and cozy shivers — think 'fun Halloween', NOT genuinely frightening. Absolutely no gore, real danger, or anything that could frighten a child before sleep. End warm and safe.",
  },
];

export function getTheme(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
