// Client-safe configuration ONLY. No API keys live here anymore.
//
// The OpenRouter and ElevenLabs keys are now read server-side in the API routes
// (app/api/*) from process.env, using plain (non-NEXT_PUBLIC_) variables, so
// they are never bundled into the browser. Add them to .env.local as:
//   OPENROUTER_API_KEY=sk-or-...
//   ELEVENLABS_API_KEY=...        (optional — only for "Read aloud")

// Default model. NOTE: the assignment's `meta-llama/llama-3.1-8b-instruct:free`
// was discontinued by OpenRouter, so we default to a working free model.
export const DEFAULT_MODEL = "google/gemma-4-31b-it:free";

// Free models for the Stage 3 "model switcher". Each was verified to return a
// streamed story — no errors, no account changes required. (The model id is not
// secret; it's chosen in the browser and sent to our /api/generate route.)
export const FREE_MODELS = [
  { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B" },
  { id: "openai/gpt-oss-120b:free", label: "GPT-OSS 120B" },
  { id: "openai/gpt-oss-20b:free", label: "GPT-OSS 20B (fast)" },
  { id: "nex-agi/nex-n2-pro:free", label: "Nex N2 Pro" },
];

// Deep, warm narrator voice from ElevenLabs' standard library (used server-side
// by /api/narrate). We deliberately do NOT clone a real person's voice.
// Swap for any voice you have the rights to: https://elevenlabs.io/app/voice-library
export const NARRATOR_VOICE_ID = "nPczCjzI2devNBz1zQrb"; // "Brian" — deep narrator
export const NARRATOR_VOICE_NAME = "Deep Storyteller";
