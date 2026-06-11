// ⚠️ CODED CLASS — API KEY LIVES HERE ⚠️
// For this exercise the OpenRouter API key is stored as a variable at the top
// of the file. This is the simple, intentional pattern for the class.
//
// SECURITY NOTE (the "security issue" mentioned in the brief):
// Anyone who can read your site's source can read this key. That's fine for
// local/class use with a FREE model key. When you push to GitHub + deploy to
// Vercel, prefer setting it as an environment variable instead of hardcoding,
// so your key isn't exposed publicly:
//   1. Create a file `.env.local`  ->  NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-...
//   2. In Vercel: Project Settings → Environment Variables → add the same name.
// The line below uses the env var if present, otherwise the hardcoded value.

export const OPENROUTER_API_KEY =
  process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "PASTE_YOUR_OPENROUTER_KEY_HERE";

// NOTE: The assignment's model `meta-llama/llama-3.1-8b-instruct:free` was
// discontinued by OpenRouter (returns 404 — only the paid version remains).
// We default to a currently-available free model that works out of the box.
export const DEFAULT_MODEL = "google/gemma-4-31b-it:free";

// Free models for the Stage 3 "model switcher".
// Every model here was verified to return a streamed story with this account —
// no errors, no privacy-setting changes required.
export const FREE_MODELS = [
  { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B" },
  { id: "openai/gpt-oss-120b:free", label: "GPT-OSS 120B" },
  { id: "openai/gpt-oss-20b:free", label: "GPT-OSS 20B (fast)" },
  { id: "nex-agi/nex-n2-pro:free", label: "Nex N2 Pro" },
];

// --- ElevenLabs text-to-speech ("Read aloud") ---
// Same local-key pattern as the OpenRouter key above. Get a free key at
// https://elevenlabs.io → Profile → API Keys, then add it to .env.local as:
//   NEXT_PUBLIC_ELEVENLABS_API_KEY=...
export const ELEVENLABS_API_KEY =
  process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "PASTE_YOUR_ELEVENLABS_KEY_HERE";

// A deep, warm, calm narrator voice from ElevenLabs' standard library.
// NOTE: We deliberately do NOT clone Morgan Freeman (or any real person) —
// that violates ElevenLabs' policy and voice-likeness rights. This is a
// soundalike-in-spirit storyteller voice. Swap the ID for any voice you have
// the rights to use (browse at https://elevenlabs.io/app/voice-library).
export const NARRATOR_VOICE_ID = "nPczCjzI2devNBz1zQrb"; // "Brian" — deep narrator
export const NARRATOR_VOICE_NAME = "Deep Storyteller";
