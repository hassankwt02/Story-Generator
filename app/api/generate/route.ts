import { NextRequest } from "next/server";
import { buildSystemPrompt, buildUserPrompt, StoryParams } from "@/lib/story";

// Runs on the server only. The OpenRouter key is read from process.env and is
// NEVER sent to the browser.
export const runtime = "nodejs";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.includes("PASTE_YOUR")) {
    return jsonError(
      "Server is missing OPENROUTER_API_KEY. Add it to .env.local (no NEXT_PUBLIC_ prefix).",
      500
    );
  }

  let params: StoryParams;
  try {
    params = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Dreamweaver Bedtime Stories",
    },
    body: JSON.stringify({
      model: params.model,
      stream: true,
      temperature: params.temperature,
      messages: [
        { role: "system", content: buildSystemPrompt(params.age) },
        { role: "user", content: buildUserPrompt(params) },
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    let detail = "";
    try {
      const d = await upstream.json();
      detail = d?.error?.message || JSON.stringify(d);
    } catch {
      detail = await upstream.text().catch(() => "");
    }
    return jsonError(
      `OpenRouter request failed (${upstream.status}). ${detail}`.trim(),
      upstream.status
    );
  }

  // Pipe OpenRouter's SSE stream straight through to the browser. The key is
  // never exposed; the client parses the SSE "data:" deltas. Pass-through keeps
  // the stream incremental (no server-side buffering).
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
