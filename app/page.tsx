"use client";

import { useEffect, useRef, useState } from "react";
import StarrySky from "@/components/StarrySky";
import { THEMES, ThemeId } from "@/lib/themes";
import { streamStory } from "@/lib/openrouter";
import { synthesizeSpeech } from "@/lib/elevenlabs";
import { DEFAULT_MODEL, FREE_MODELS, NARRATOR_VOICE_NAME } from "@/lib/config";

export default function Home() {
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("");
  const [theme, setTheme] = useState<ThemeId>("fantasy");
  const [plot, setPlot] = useState("");

  const [model, setModel] = useState(DEFAULT_MODEL);
  const [temperature, setTemperature] = useState(0.8);

  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Read-aloud (text-to-speech) state.
  const [narrating, setNarrating] = useState(false); // synthesising audio
  const [playing, setPlaying] = useState(false); // audio currently playing
  const [audioError, setAudioError] = useState("");

  // Whether the server has the keys configured (fetched from /api/status).
  const [storyReady, setStoryReady] = useState(true); // assume ok to avoid banner flash
  const [voiceReady, setVoiceReady] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Ask the server whether the API keys are configured (no keys are returned).
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((s) => {
        setStoryReady(!!s.storyReady);
        setVoiceReady(!!s.voiceReady);
      })
      .catch(() => {});
  }, []);

  // Auto-scroll the story panel as new text streams in.
  useEffect(() => {
    if (loading && storyRef.current) {
      storyRef.current.scrollTop = storyRef.current.scrollHeight;
    }
  }, [story, loading]);

  // Tidy up any audio + object URL when the component unmounts.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  function stopNarration() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
  }

  async function handleReadAloud() {
    setAudioError("");

    // Toggle off if already playing.
    if (playing) {
      stopNarration();
      return;
    }
    if (!story) return;

    if (!voiceReady) {
      setAudioError(
        "Narration isn't available — the server has no ElevenLabs key configured."
      );
      return;
    }

    setNarrating(true);
    try {
      const blob = await synthesizeSpeech(story);

      // Replace any previous audio/URL.
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.onpause = () => setPlaying(false);

      await audio.play();
      setPlaying(true);
    } catch (err) {
      setAudioError((err as Error).message || "Couldn't narrate the story.");
    } finally {
      setNarrating(false);
    }
  }

  const canGenerate = childName.trim() !== "" && plot.trim() !== "" && !loading;

  async function handleGenerate() {
    setError("");

    if (!childName.trim() || !plot.trim()) {
      setError("Please add your child's name and a few events from their day.");
      return;
    }

    stopNarration();
    setAudioError("");
    setStory("");
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamStory(
        { childName, age, theme, plot, model, temperature },
        (token) => setStory((prev) => prev + token),
        controller.signal
      );
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  async function handleCopy() {
    if (!story) return;
    await navigator.clipboard?.writeText(story);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <StarrySky />

      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-20 pt-16 sm:pt-24">
        {/* Header */}
        <header className="mb-10 text-center">
          <p className="mb-2 text-3xl">🌙 ✨</p>
          <h1 className="bg-gradient-to-b from-white to-starlight/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Dreamweaver
          </h1>
          <p className="mx-auto mt-3 max-w-md text-starlight/70">
            Turn your child&apos;s day into a magical bedtime story, written
            just for them.
          </p>
        </header>

        {/* Key-missing banner (driven by the server, no key exposed) */}
        {!storyReady && (
          <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            ⚠️ No API key set on the server yet. Add{" "}
            <code className="rounded bg-black/30 px-1">OPENROUTER_API_KEY</code>{" "}
            to <code className="rounded bg-black/30 px-1">.env.local</code> (no{" "}
            <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_</code> prefix)
            and restart the dev server.
          </div>
        )}

        {/* Form card */}
        <section className="glass animate-fade-in rounded-3xl p-6 shadow-2xl sm:p-8">
          {/* Name + age */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-starlight/90">
                Child&apos;s name
              </label>
              <input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g. Layla"
                className="w-full rounded-xl border border-starlight/15 bg-night-900/60 px-4 py-3 text-starlight outline-none transition focus:border-starlight/40"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-starlight/90">
                Age
              </label>
              <input
                value={age}
                onChange={(e) =>
                  setAge(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))
                }
                inputMode="numeric"
                placeholder="6"
                className="w-full rounded-xl border border-starlight/15 bg-night-900/60 px-4 py-3 text-starlight outline-none transition focus:border-starlight/40"
              />
            </div>
          </div>

          {/* Theme picker */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-starlight/90">
              Choose a theme
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {THEMES.map((t) => {
                const selected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`rounded-2xl border bg-gradient-to-br p-3 text-center transition ${
                      selected
                        ? `${t.accent} scale-[1.03] shadow-lg`
                        : "border-starlight/10 from-night-800/40 to-night-900/40 hover:border-starlight/30"
                    }`}
                  >
                    <div className="text-2xl">{t.emoji}</div>
                    <div className="mt-1 text-sm font-semibold text-starlight">
                      {t.label}
                    </div>
                    <div className="mt-0.5 text-[11px] leading-tight text-starlight/55">
                      {t.blurb}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plot */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-starlight/90">
              What happened in their day?
            </label>
            <textarea
              value={plot}
              onChange={(e) => setPlot(e.target.value)}
              rows={4}
              placeholder="We went to the park, fed the ducks, and she lost her red balloon but a kind dog found it..."
              className="w-full resize-none rounded-xl border border-starlight/15 bg-night-900/60 px-4 py-3 text-starlight outline-none transition focus:border-starlight/40"
            />
          </div>

          {/* Storyteller controls: model switcher + temperature slider */}
          <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-starlight/10 bg-night-900/40 p-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-starlight/60">
                Story model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-starlight/15 bg-night-900/70 px-3 py-2 text-sm text-starlight outline-none transition focus:border-starlight/40"
              >
                {FREE_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-night-900">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-starlight/60">
                <span>Creativity</span>
                <span className="text-starlight/80">{temperature.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-fuchsia-400"
              />
              <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-starlight/40">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-5 py-3.5 font-semibold text-white shadow-lg transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Weaving your story…" : "✨ Weave the Story"}
            </button>
            {loading && (
              <button
                onClick={handleStop}
                className="rounded-xl border border-starlight/20 px-4 py-3.5 text-starlight/80 transition hover:bg-night-800/60"
              >
                Stop
              </button>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
        </section>

        {/* Story output */}
        {(story || loading) && (
          <section className="glass animate-fade-in mt-8 rounded-3xl p-6 shadow-2xl sm:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-starlight">
                {childName ? `${childName}'s Bedtime Story` : "Bedtime Story"}
              </h2>
              {story && !loading && (
                <div className="flex items-center gap-2">
                  {/* Read-aloud only appears when the server has an ElevenLabs key. */}
                  {voiceReady && (
                    <button
                      onClick={handleReadAloud}
                      disabled={narrating}
                      title={`Narrated by the ${NARRATOR_VOICE_NAME} voice`}
                      className="flex items-center gap-1.5 rounded-lg border border-starlight/15 px-3 py-1 text-xs text-starlight/70 transition hover:bg-night-800/60 hover:text-starlight disabled:opacity-50"
                    >
                      {narrating
                        ? "🎙️ Narrating…"
                        : playing
                          ? "⏹ Stop"
                          : "🔊 Read aloud"}
                    </button>
                  )}
                  <button
                    onClick={handleCopy}
                    className="rounded-lg border border-starlight/15 px-3 py-1 text-xs text-starlight/70 transition hover:bg-night-800/60 hover:text-starlight"
                  >
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>

            {audioError && (
              <p className="mb-4 rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-200">
                {audioError}
              </p>
            )}
            <div
              ref={storyRef}
              className="story-prose max-h-[60vh] overflow-y-auto whitespace-pre-wrap pr-2 font-serif text-[1.05rem] leading-relaxed text-starlight/90"
            >
              {story}
              {loading && !story && (
                <span className="text-starlight/50">
                  The storyteller is dreaming up something special…
                </span>
              )}
              {loading && (
                <span className="ml-0.5 inline-block h-5 w-2 animate-pulse bg-starlight/70 align-middle" />
              )}
            </div>
          </section>
        )}

        <footer className="mt-10 text-center text-xs text-starlight/40">
          Sweet dreams. Stories are generated by AI — a parent should always
          read along. 🌟
        </footer>
      </div>
    </main>
  );
}
