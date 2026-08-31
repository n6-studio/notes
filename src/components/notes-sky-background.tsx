"use client";

import { useLingui } from "@lingui/react/macro";
import type { CSSProperties } from "react";
import { NotesGrassHill } from "~/components/grass-hill";

interface SkyStar {
  opacity: number;
  rotate: number;
  scale: number;
  twinkleDelay?: string;
  x: number;
  y: number;
}

const STARS: SkyStar[] = [
  { opacity: 0.36, rotate: 4, scale: 0.018, x: 5, y: 8 },
  { opacity: 0.22, rotate: 18, scale: 0.012, x: 14, y: 17 },
  { opacity: 0.44, rotate: 10, scale: 0.021, x: 21, y: 4 },
  { opacity: 0.24, rotate: 26, scale: 0.013, x: 30, y: 13 },
  { opacity: 0.32, rotate: 2, scale: 0.016, x: 38, y: 6 },
  { opacity: 0.2, rotate: 20, scale: 0.011, x: 47, y: 16 },
  { opacity: 0.4, rotate: 14, scale: 0.019, x: 55, y: 3 },
  { opacity: 0.26, rotate: 30, scale: 0.014, x: 63, y: 11 },
  { opacity: 0.22, rotate: 8, scale: 0.012, x: 90, y: 5 },
  { opacity: 0.34, rotate: 16, scale: 0.016, x: 96, y: 14 },
  { opacity: 0.18, rotate: 22, scale: 0.011, x: 8, y: 24 },
  { opacity: 0.2, rotate: 6, scale: 0.012, x: 42, y: 21 },
  { opacity: 0.28, rotate: 12, scale: 0.014, x: 68, y: 19 },
  { opacity: 0.16, rotate: 24, scale: 0.01, x: 86, y: 22 },
  {
    opacity: 0.34,
    rotate: 0,
    scale: 0.024,
    twinkleDelay: "1.4s",
    x: 26,
    y: 26,
  },
  {
    opacity: 0.3,
    rotate: 10,
    scale: 0.022,
    twinkleDelay: "4.8s",
    x: 93,
    y: 23,
  },
];

const STAR_PATH =
  "M12 0 14.05 9.95 24 12 14.05 14.05 12 24 9.95 14.05 0 12 9.95 9.95Z";
const STAR_FILL = "oklch(0.92 0.025 210)";
const MOON_X = 54;
const MOON_Y = 7;
const MOON_R = 5.6;
const MOON_GLOW_R = 12;
const MOON_CUT_X = 56.3;
const MOON_CUT_Y = 5.6;
const MOON_CUT_R = 5;

function starTransform(star: SkyStar) {
  return `translate(${star.x} ${star.y}) rotate(${star.rotate}) scale(${star.scale}) translate(-12 -12)`;
}

function sparkleStyle(star: SkyStar): CSSProperties | undefined {
  if (star.twinkleDelay === undefined) {
    return;
  }

  return {
    "--twinkle-max": (
      Math.round(Math.min(star.opacity * 1.18, 0.5) * 100) / 100
    ).toString(),
    "--twinkle-min": (Math.round(star.opacity * 58) / 100).toString(),
    animationDelay: star.twinkleDelay,
  } as CSSProperties;
}

export function NotesSkyBackground() {
  const { t } = useLingui();

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="sky-scene-wash notes-sky-wash absolute inset-0" />
        <div className="sky-scene-stars absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <svg
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="xMidYMin slice"
              viewBox="0 0 100 70"
            >
              <title>{t`Decorative moonlit sky`}</title>
              <defs>
                <radialGradient
                  cx="50%"
                  cy="50%"
                  id="notes-sky-moon-glow"
                  r="50%"
                >
                  <stop
                    offset="0"
                    stopColor="oklch(0.86 0.05 210)"
                    stopOpacity="0.38"
                  />
                  <stop
                    offset="0.4"
                    stopColor="oklch(0.72 0.055 220)"
                    stopOpacity="0.12"
                  />
                  <stop
                    offset="1"
                    stopColor="oklch(0.5 0.04 230)"
                    stopOpacity="0"
                  />
                </radialGradient>
                <radialGradient
                  cx="38%"
                  cy="32%"
                  id="notes-sky-moon-fill"
                  r="68%"
                >
                  <stop offset="0" stopColor="oklch(0.96 0.02 95)" />
                  <stop offset="0.55" stopColor="oklch(0.88 0.03 90)" />
                  <stop offset="1" stopColor="oklch(0.76 0.04 80)" />
                </radialGradient>
                <mask id="notes-sky-crescent" maskUnits="userSpaceOnUse">
                  <rect fill="black" height="70" width="100" x="0" y="0" />
                  <circle cx={MOON_X} cy={MOON_Y} fill="white" r={MOON_R} />
                  <circle
                    cx={MOON_CUT_X}
                    cy={MOON_CUT_Y}
                    fill="black"
                    r={MOON_CUT_R}
                  />
                </mask>
              </defs>
              <circle
                cx={MOON_X}
                cy={MOON_Y}
                fill="url(#notes-sky-moon-glow)"
                r={MOON_GLOW_R}
              />
              <circle
                cx={MOON_X}
                cy={MOON_Y}
                fill="url(#notes-sky-moon-fill)"
                mask="url(#notes-sky-crescent)"
                r={MOON_R}
              />
            </svg>
          </div>
          <div className="night-sky-layer absolute inset-0 overflow-hidden">
            <svg
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="xMidYMin slice"
              viewBox="0 0 100 70"
            >
              <title>{t`Decorative moonlit sky`}</title>
              <defs>
                <path d={STAR_PATH} id="notes-sky-star" />
              </defs>
              {STARS.map((star) => (
                <use
                  className={
                    star.twinkleDelay === undefined
                      ? undefined
                      : "night-sky-sparkle"
                  }
                  fill={STAR_FILL}
                  href="#notes-sky-star"
                  key={`${star.x}-${star.y}`}
                  opacity={star.opacity}
                  style={sparkleStyle(star)}
                  transform={starTransform(star)}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
      <NotesGrassHill />
    </>
  );
}
