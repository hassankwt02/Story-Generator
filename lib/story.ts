import { getTheme, ThemeId } from "./themes";

export interface StoryParams {
  childName: string;
  age: string;
  theme: ThemeId;
  plot: string;
  model: string;
  temperature: number;
}

export function buildSystemPrompt(age: string): string {
  return [
    "You are Dreamweaver, a warm and imaginative children's bedtime storyteller.",
    `You write short, age-appropriate stories for a ${age || "young"}-year-old child.`,
    "Rules you must always follow:",
    "- The child is the hero of the story.",
    "- Keep vocabulary and concepts suitable for the child's age.",
    "- Absolutely nothing violent, gory, mature, or genuinely frightening.",
    "- Gently weave in the real events from the child's day that the parent describes.",
    "- Length: roughly 350-600 words, divided into short paragraphs.",
    "- End on a calm, cozy, reassuring note that helps the child drift off to sleep.",
    "- Output only the story prose. Do not include a title, headings, or commentary.",
  ].join("\n");
}

export function buildUserPrompt(p: StoryParams): string {
  const theme = getTheme(p.theme);
  return [
    `Write a ${theme.label.toLowerCase()} bedtime story.`,
    `Theme guidance: ${theme.guidance}`,
    "",
    `The hero's name is: ${p.childName || "the child"}.`,
    `The hero's age is: ${p.age || "unknown"}.`,
    "",
    "Here is what really happened in the child's day (transform these real events into the story):",
    p.plot.trim() ||
      "(The parent did not describe specific events — invent a gentle day.)",
  ].join("\n");
}
