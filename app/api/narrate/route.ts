import { NextRequest } from "next/server";
import { NARRATOR_VOICE_ID } from "@/lib/config";

// Server-only. The ElevenLabs key is read from process.env and never reaches
// the browser; the route returns the raw MP3 audio stream.
export const runtime = "nodejs";

const ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey.includes("PASTE_YOUR")) {
    return jsonError("Server is missing ELEVENLABS_API_KEY.", 500);
  }

  let text = "";
  try {
    const body = await req.json();
    text = (body?.text ?? "").toString();
  } catch {
    return jsonError("Invalid request body.", 400);
  }
  if (!text.trim()) {
    return jsonError("No text to narrate.", 400);
  }

  const upstream = await fetch(`${ELEVENLABS_TTS_URL}/${NARRATOR_VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.1,
        use_speaker_boost: true,
      },
    }),
  });

  if (!upstream.ok || !upstream.body) {
    let detail = "";
    try {
      const d = await upstream.json();
      detail = d?.detail?.message || d?.detail || JSON.stringify(d);
    } catch {
      detail = await upstream.text().catch(() => "");
    }
    return jsonError(
      `ElevenLabs request failed (${upstream.status}). ${detail}`.trim(),
      upstream.status
    );
  }

  return new Response(upstream.body, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
