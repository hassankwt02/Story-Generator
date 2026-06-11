// Reports whether the server-side keys are configured, WITHOUT ever sending
// the keys themselves to the browser. Used to drive the setup banner and to
// show/hide the "Read aloud" button.
export const runtime = "nodejs";

function configured(value: string | undefined): boolean {
  return !!value && !value.includes("PASTE_YOUR");
}

export function GET() {
  return Response.json({
    storyReady: configured(process.env.OPENROUTER_API_KEY),
    voiceReady: configured(process.env.ELEVENLABS_API_KEY),
  });
}
