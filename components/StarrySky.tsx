"use client";

import { useMemo } from "react";

// A palette of subtly different star colours — mostly white, with hints of
// cool blue and warm gold so the sky doesn't look flat.
const STAR_COLORS = ["#ffffff", "#cdd6ff", "#fde7c0", "#bcd0ff", "#e9d5ff"];

/** Tiny seeded RNG so the server and client render the exact same sky
 *  (avoids React hydration mismatches from Math.random). */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

interface GlowStar {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

function makeGlowStars(count: number, seed: number): GlowStar[] {
  const rng = makeRng(seed);
  const stars: GlowStar[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: +(rng() * 100).toFixed(2),
      y: +(rng() * 100).toFixed(2),
      size: +(1 + rng() * 2.4).toFixed(2),
      // Negative delay so stars start mid-animation — no synchronised "pop".
      delay: +(rng() * 9).toFixed(2),
      // Slow, varied glow cycles between 5s and 11s.
      duration: +(5 + rng() * 6).toFixed(2),
      color: STAR_COLORS[Math.floor(rng() * STAR_COLORS.length)],
    });
  }
  return stars;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

function makeSparkles(count: number, seed: number): Sparkle[] {
  const rng = makeRng(seed);
  const sparkles: Sparkle[] = [];
  for (let i = 0; i < count; i++) {
    sparkles.push({
      x: +(rng() * 100).toFixed(2),
      y: +(rng() * 90).toFixed(2),
      size: +(10 + rng() * 16).toFixed(2),
      delay: +(rng() * 8).toFixed(2),
      duration: +(6 + rng() * 6).toFixed(2),
      color: rng() > 0.5 ? "#ffffff" : "#cdd6ff",
    });
  }
  return sparkles;
}

export default function StarrySky() {
  const stars = useMemo(() => makeGlowStars(140, 13), []);
  const sparkles = useMemo(() => makeSparkles(14, 29), []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      {/* Slow, independently glowing stars */}
      {stars.map((s, i) => (
        <span
          key={`star-${i}`}
          className="glow-star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            color: s.color,
            animationDelay: `-${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}

      {/* Four-point sparkle feature stars */}
      {sparkles.map((s, i) => (
        <span
          key={`sparkle-${i}`}
          className="sparkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            color: s.color,
            animationDelay: `-${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}

      {/* Occasional slow shooting stars */}
      <div
        className="shooting"
        style={{ left: "6%", top: "16%", animationDuration: "12s", animationDelay: "3s" }}
      />
      <div
        className="shooting"
        style={{ left: "48%", top: "8%", animationDuration: "17s", animationDelay: "9s" }}
      />

      {/* The glowing moon */}
      <div className="absolute right-8 top-10 sm:right-16 sm:top-16">
        <div className="relative h-24 w-24 animate-float sm:h-32 sm:w-32">
          <div className="absolute inset-0 animate-glow rounded-full bg-moon" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#fdf6df] to-[#e6d49a]" />
          {/* craters */}
          <div className="absolute left-5 top-6 h-4 w-4 rounded-full bg-[#d9c485]/60" />
          <div className="absolute left-12 top-12 h-6 w-6 rounded-full bg-[#d9c485]/50" />
          <div className="absolute left-6 top-16 h-3 w-3 rounded-full bg-[#d9c485]/60" />
        </div>
      </div>
    </div>
  );
}
