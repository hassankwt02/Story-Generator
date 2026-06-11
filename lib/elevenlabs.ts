import {
  ELEVENLABS_API_KEY,
  NARRATOR_VOICE_ID,
} from "./config";

const ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";

/**
 * Converts story text to narrated speech using ElevenLabs, entirely client-side
 * with the user's own API key. Returns an MP3 audio Blob to play in the browser.
 */
export async function synthesizeSpeech(
  text: string,
  signal?: AbortSignal
): Promise<Blob> {
  const response = await fetch(`${ELEVENLABS_TTS_URL}/${NARRATOR_VOICE_ID}`, {
    method: "POST",
    signal,
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      // Calm, consistent narration tuned for bedtime reading.
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.1,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const data = await response.json();
      detail = data?.detail?.message || data?.detail || JSON.stringify(data);
    } catch {
      detail = await response.text().catch(() => "");
    }
    throw new Error(
      `ElevenLabs request failed (${response.status}). ${detail}`.trim()
    );
  }

  return await response.blob();
}
