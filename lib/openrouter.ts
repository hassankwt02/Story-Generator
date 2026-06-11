import { getTheme, ThemeId } from "./themes";
import { OPENROUTER_API_KEY } from "./config";

export interface StoryRequest {
  childName: string;
  age: string;
  theme: ThemeId;
  plot: string;
  model: string;
  temperature: number;
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function buildSystemPrompt(age: string): string {
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

function buildUserPrompt(req: StoryRequest): string {
  const theme = getTheme(req.theme);
  return [
    `Write a ${theme.label.toLowerCase()} bedtime story.`,
    `Theme guidance: ${theme.guidance}`,
    "",
    `The hero's name is: ${req.childName || "the child"}.`,
    `The hero's age is: ${req.age || "unknown"}.`,
    "",
    "Here is what really happened in the child's day (transform these real events into the story):",
    req.plot.trim() || "(The parent did not describe specific events — invent a gentle day.)",
  ].join("\n");
}

/**
 * Streams a generated story from OpenRouter, calling `onToken` for each chunk.
 * Runs entirely client-side using the parent's own API key.
 */
export async function streamStory(
  req: StoryRequest,
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "X-Title": "Dreamweaver Bedtime Stories",
    },
    body: JSON.stringify({
      model: req.model,
      stream: true,
      temperature: req.temperature,
      messages: [
        { role: "system", content: buildSystemPrompt(req.age) },
        { role: "user", content: buildUserPrompt(req) },
      ],
    }),
  });

  if (!response.ok || !response.body) {
    let detail = "";
    try {
      const data = await response.json();
      detail = data?.error?.message || JSON.stringify(data);
    } catch {
      detail = await response.text().catch(() => "");
    }
    throw new Error(
      `OpenRouter request failed (${response.status}). ${detail}`.trim()
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;

      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;

      try {
        const json = JSON.parse(data);
        const token: string | undefined = json.choices?.[0]?.delta?.content;
        if (token) onToken(token);
      } catch {
        // Ignore keep-alive comments / partial JSON fragments.
      }
    }
  }
}
