/**
 * Requests narration audio from our own server route (/api/narrate), which
 * holds the ElevenLabs key. The browser never sees the key — it just receives
 * the MP3 audio Blob to play.
 */
export async function synthesizeSpeech(
  text: string,
  signal?: AbortSignal
): Promise<Blob> {
  const response = await fetch("/api/narrate", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    let message = `Narration failed (${response.status}).`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // keep the default message
    }
    throw new Error(message);
  }

  return await response.blob();
}
