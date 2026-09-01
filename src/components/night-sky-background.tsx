"use client";

import { useLingui } from "@lingui/react/macro";
import { type CSSProperties, useEffect, useState } from "react";
import { GrassHill } from "~/components/grass-hill";
import { cn } from "~/lib/utils";

interface SkyStar {
  opacity: number;
  rotate: number;
  scale: number;
  twinkleDelay?: string;
  x: number;
  y: number;
}

interface FallFlight {
  durationS: number;
  path: string;
  restS: number;
  tail: number;
}

const STARS: SkyStar[] = [
  { opacity: 0.4, rotate: 8, scale: 0.02, x: 7, y: 7 },
  { opacity: 0.28, rotate: 22, scale: 0.014, x: 18, y: 15 },
  { opacity: 0.46, rotate: 0, scale: 0.022, x: 24, y: 4 },
  { opacity: 0.26, rotate: 14, scale: 0.013, x: 34, y: 12 },
  { opacity: 0.36, rotate: 32, scale: 0.017, x: 42, y: 5 },
  { opacity: 0.4, rotate: 6, scale: 0.02, x: 53, y: 10 },
  { opacity: 0.28, rotate: 18, scale: 0.013, x: 61, y: 3 },
  { opacity: 0.32, rotate: 28, scale: 0.015, x: 72, y: 14 },
  { opacity: 0.44, rotate: 4, scale: 0.021, x: 81, y: 6 },
  { opacity: 0.28, rotate: 16, scale: 0.014, x: 91, y: 11 },
  { opacity: 0.22, rotate: 12, scale: 0.012, x: 13, y: 22 },
  { opacity: 0.24, rotate: 24, scale: 0.013, x: 47, y: 19 },
  { opacity: 0.2, rotate: 10, scale: 0.012, x: 88, y: 20 },
  {
    opacity: 0.38,
    rotate: 0,
    scale: 0.03,
    twinkleDelay: "0s",
    x: 11,
    y: 28,
  },
  {
    opacity: 0.34,
    rotate: 8,
    scale: 0.026,
    twinkleDelay: "3.1s",
    x: 79,
    y: 22,
  },
];

const STAR_PATH =
  "M12 0 14.05 9.95 24 12 14.05 14.05 12 24 9.95 14.05 0 12 9.95 9.95Z";
const STAR_FILL = "oklch(0.9 0.03 265)";
const FALL_STAR_SCALE = 0.02;
const UI_EASE_SPLINE = "0.2 0 0 1";
const FALL_PEAK_OPACITY = 0.42;
const FALL_HOLD_OPACITY = 0.38;
const FALL_SHINE_OPACITY = 0.72;
const FALL_SHINE_SCALE = 1.28;
const SHINE_SPLINES = `${UI_EASE_SPLINE}; ${UI_EASE_SPLINE}; ${UI_EASE_SPLINE}; ${UI_EASE_SPLINE}; ${UI_EASE_SPLINE}`;

const VIEW_W = 100;
const FALL_LENGTH_MIN = 8;
const FALL_LENGTH_MAX = 16;
const FALL_START_Y_MIN = 6;
const FALL_START_Y_MAX = 18;
const FALL_ANGLE_MIN = 26;
const FALL_ANGLE_MAX = 36;
const FALL_STRAIGHT_T_MIN = 0.84;
const FALL_STRAIGHT_T_MAX = 0.91;
const FALL_HOOK_MIN = 0.45;
const FALL_HOOK_MAX = 1;
const FALL_DURATION_MIN = 4.6;
const FALL_DURATION_MAX = 7.8;
const FALL_REST_MIN = 4;
const FALL_REST_MAX = 12;
const FALL_EDGE = 4;
const FALL_END_CEILING = 32;

function between(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function svgCoord(value: number) {
  return Math.round(value * 10) / 10;
}

function nextFallFlight(): FallFlight {
  const length = between(FALL_LENGTH_MIN, FALL_LENGTH_MAX);
  const goRight = Math.random() >= 0.5;
  const startX = goRight
    ? between(FALL_EDGE, VIEW_W - FALL_EDGE - length)
    : between(FALL_EDGE + length, VIEW_W - FALL_EDGE);
  const startY = between(FALL_START_Y_MIN, FALL_START_Y_MAX);
  const dir = goRight ? 1 : -1;
  const drop =
    length *
    Math.tan((between(FALL_ANGLE_MIN, FALL_ANGLE_MAX) * Math.PI) / 180);
  const straightT = between(FALL_STRAIGHT_T_MIN, FALL_STRAIGHT_T_MAX);
  const midX = startX + dir * length * straightT;
  const midY = startY + drop * straightT;
  const remain = 1 - straightT;
  const ctrlX = midX + dir * length * remain * 0.38;
  const ctrlY = midY + drop * remain * 0.38;
  const endX = startX + dir * length;
  const endY = Math.min(
    FALL_END_CEILING,
    startY + drop + between(FALL_HOOK_MIN, FALL_HOOK_MAX)
  );
  const path = `M ${svgCoord(startX)} ${svgCoord(startY)} L ${svgCoord(midX)} ${svgCoord(midY)} Q ${svgCoord(ctrlX)} ${svgCoord(ctrlY)} ${svgCoord(endX)} ${svgCoord(endY)}`;

  return {
    durationS: between(FALL_DURATION_MIN, FALL_DURATION_MAX),
    path,
    restS: between(FALL_REST_MIN, FALL_REST_MAX),
    tail: between(2.2, Math.min(4.2, length * 0.32)),
  };
}

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

function NightSkyFallingStar() {
  const [flight, setFlight] = useState<FallFlight | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    setFlight(nextFallFlight());
  }, []);

  useEffect(() => {
    if (!flight) {
      return;
    }

    const waitMs = (flight.durationS + flight.restS) * 1000;
    const timeoutId = window.setTimeout(() => {
      setFlight(nextFallFlight());
    }, waitMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [flight]);

  if (!flight) {
    return null;
  }

  const dur = `${flight.durationS}s`;
  const tailTip = (-flight.tail).toString();
  const shineTail = (-flight.tail * 1.18).toString();
  const motion = {
    begin: "0s",
    calcMode: "spline",
    dur,
    keyPoints: "0;0.82;1",
    keySplines: `0.4 0 0.72 0.48; ${UI_EASE_SPLINE}`,
    keyTimes: "0;0.8;1",
    path: flight.path,
    repeatCount: "1",
  } as const;

  return (
    <g
      className="night-sky-fall"
      key={`${flight.path}:${flight.durationS}:${flight.restS}`}
      opacity={0}
    >
      <animate
        attributeName="opacity"
        begin="0s"
        calcMode="spline"
        dur={dur}
        keySplines={SHINE_SPLINES}
        keyTimes="0;0.08;0.58;0.7;0.78;1"
        repeatCount="1"
        values={`0;${FALL_PEAK_OPACITY};${FALL_HOLD_OPACITY};${FALL_SHINE_OPACITY};${FALL_HOLD_OPACITY};0`}
      />
      <g>
        <animateMotion {...motion} rotate="auto" />
        <line
          stroke="url(#night-sky-fall-tail)"
          strokeLinecap="round"
          strokeWidth="0.13"
          x1="0"
          x2="0"
          y1="0"
          y2="0"
        >
          <animate
            attributeName="x1"
            begin="0s"
            calcMode="spline"
            dur={dur}
            keySplines={SHINE_SPLINES}
            keyTimes="0;0.16;0.58;0.7;0.78;1"
            repeatCount="1"
            values={`0;${tailTip};${tailTip};${shineTail};${tailTip};0`}
          />
        </line>
      </g>
      <g>
        <animateMotion {...motion} rotate="0" />
        <g>
          <animateTransform
            additive="sum"
            attributeName="transform"
            begin="0s"
            calcMode="spline"
            dur={dur}
            keySplines={`${UI_EASE_SPLINE}; ${UI_EASE_SPLINE}; ${UI_EASE_SPLINE}; ${UI_EASE_SPLINE}`}
            keyTimes="0;0.58;0.7;0.78;1"
            repeatCount="1"
            type="scale"
            values={`1;1;${FALL_SHINE_SCALE};1;1`}
          />
          <use
            fill={STAR_FILL}
            href="#night-sky-star"
            transform={`scale(${FALL_STAR_SCALE}) translate(-12 -12)`}
          />
        </g>
      </g>
    </g>
  );
}

export function NightSkyBackground({
  wash = "home",
}: {
  wash?: "home" | "notes";
}) {
  const { t } = useLingui();
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={cn(
            "sky-scene-wash sky-wash absolute inset-0",
            wash === "notes" ? "notes-sky-wash" : "night-sky-wash"
          )}
        />
        <div className="sky-scene-stars night-sky-layer absolute inset-0 overflow-hidden">
          <svg
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMin slice"
            viewBox="0 0 100 70"
          >
            <title>{t`Decorative night sky`}</title>
            <defs>
              <path d={STAR_PATH} id="night-sky-star" />
              <linearGradient
                id="night-sky-fall-tail"
                x1="0"
                x2="1"
                y1="0"
                y2="0"
              >
                <stop offset="0" stopColor={STAR_FILL} stopOpacity="0" />
                <stop offset="0.68" stopColor={STAR_FILL} stopOpacity="0.18" />
                <stop offset="1" stopColor={STAR_FILL} stopOpacity="0.5" />
              </linearGradient>
            </defs>
            {STARS.map((star) => (
              <use
                className={
                  star.twinkleDelay === undefined
                    ? undefined
                    : "night-sky-sparkle"
                }
                fill={STAR_FILL}
                href="#night-sky-star"
                key={`${star.x}-${star.y}`}
                opacity={star.opacity}
                style={sparkleStyle(star)}
                transform={starTransform(star)}
              />
            ))}
            <NightSkyFallingStar />
          </svg>
        </div>
      </div>
      <GrassHill />
    </>
  );
}
