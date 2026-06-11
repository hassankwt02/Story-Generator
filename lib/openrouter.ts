import { StoryParams } from "./story";

/**
 * Streams a generated story from our own server route (/api/generate), which
 * holds the OpenRouter key. The browser never sees the key. The route returns
 * a plain-text stream; we forward each chunk to `onToken`.
 */
export async function streamStory(
  params: StoryParams,
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch("/api/generate", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok || !response.body) {
    let message = `Request failed (${response.status}).`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // keep the default message
    }
    throw new Error(message);
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
      if (!trimmed.startsWith("data:")) continue; // skip SSE comments / keep-alives

      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;

      try {
        const json = JSON.parse(data);
        const token: string | undefined = json.choices?.[0]?.delta?.content;
        if (token) onToken(token);
      } catch {
        // ignore partial JSON fragments
      }
    }
  }
}
