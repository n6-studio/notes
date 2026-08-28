import { useLingui } from "@lingui/react/macro";

const VIEW_W = 1600;
const VIEW_H = 220;
const EDGE_LIFT = 22;
const PEAK_LIFT = 82;
const BUMP_SPREAD = 0.46;
const RIDGE_STEPS = 96;

const HILL_FILL = "url(#grass-hill-body)";
const BACK_GRASS_FILL = "oklch(0.34 0.09 148)";
const RIDGE_GRASS_FILL = "oklch(0.3 0.085 148)";
const FRONT_GRASS_FILL = "oklch(0.27 0.078 150)";

function svgCoord(value: number) {
  return Math.round(value * 10) / 10;
}

function createRng(seed: number) {
  let state = seed % 2_147_483_647;
  if (state <= 0) {
    state += 2_147_483_646;
  }

  return () => {
    state = (state * 16_807) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };
}

function hillY(x: number) {
  const t = (x / VIEW_W - 0.5) / BUMP_SPREAD;
  const bump = Math.exp(-0.5 * t * t);
  return VIEW_H - EDGE_LIFT - PEAK_LIFT * bump;
}

function bladePath(
  x: number,
  originY: number,
  height: number,
  lean: number,
  halfW: number
) {
  return `M${svgCoord(x - halfW)} ${svgCoord(originY)}L${svgCoord(x + lean)} ${svgCoord(originY - height)}L${svgCoord(x + halfW)} ${svgCoord(originY)}Z`;
}

function buildHillBody(rng: () => number) {
  let d = `M0 ${VIEW_H}`;

  for (let i = 0; i <= RIDGE_STEPS; i += 1) {
    const x = (i / RIDGE_STEPS) * VIEW_W;
    const jitter = (rng() - 0.5) * 1.6;
    d += `L${svgCoord(x)} ${svgCoord(hillY(x) + jitter)}`;
  }

  d += `L${VIEW_W} ${VIEW_H}Z`;
  return d;
}

function buildGrass(options: {
  count: number;
  halfW: [number, number];
  height: [number, number];
  lean: number;
  plant: number;
  seed: number;
  tuftSpread: number;
}) {
  const rng = createRng(options.seed);
  const parts: string[] = [];
  let remaining = options.count;

  while (remaining > 0) {
    const tuftSize = Math.min(remaining, 3 + Math.floor(rng() * 5));
    const cx = rng() * VIEW_W;
    remaining -= tuftSize;

    for (let i = 0; i < tuftSize; i += 1) {
      const x = cx + (rng() - 0.5) * options.tuftSpread;
      if (x < -4 || x > VIEW_W + 4) {
        continue;
      }

      const ridge = hillY(x);
      const originY = ridge + rng() * options.plant;
      const height =
        options.height[0] + rng() * (options.height[1] - options.height[0]);
      const lean = (rng() - 0.5) * options.lean * height;
      const halfW =
        options.halfW[0] + rng() * (options.halfW[1] - options.halfW[0]);
      parts.push(bladePath(x, originY, height, lean, halfW));
    }
  }

  return parts.join("");
}

const HILL_BODY = buildHillBody(createRng(7));
const BACK_GRASS = buildGrass({
  count: 280,
  halfW: [0.32, 0.78],
  height: [20, 44],
  lean: 0.56,
  plant: 5,
  seed: 11,
  tuftSpread: 12,
});
const RIDGE_GRASS = buildGrass({
  count: 360,
  halfW: [0.24, 0.64],
  height: [14, 34],
  lean: 0.48,
  plant: 4,
  seed: 19,
  tuftSpread: 9,
});
const FRONT_GRASS = buildGrass({
  count: 80,
  halfW: [0.36, 0.95],
  height: [8, 20],
  lean: 0.34,
  plant: 32,
  seed: 29,
  tuftSpread: 11,
});

export function GrassHill() {
  const { t } = useLingui();

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[min(11vh,6.25rem)] w-full md:h-[min(20vh,10.5rem)]"
      preserveAspectRatio="none"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
    >
      <title>{t`Decorative grass hill`}</title>
      <defs>
        <linearGradient
          gradientUnits="objectBoundingBox"
          id="grass-hill-body"
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop offset="0" stopColor="oklch(0.42 0.1 148)" />
          <stop offset="0.5" stopColor="oklch(0.34 0.08 147)" />
          <stop offset="1" stopColor="oklch(0.27 0.062 150)" />
        </linearGradient>
      </defs>
      <path d={HILL_BODY} fill={HILL_FILL} />
      <path d={BACK_GRASS} fill={BACK_GRASS_FILL} />
      <path d={RIDGE_GRASS} fill={RIDGE_GRASS_FILL} />
      <path d={FRONT_GRASS} fill={FRONT_GRASS_FILL} />
    </svg>
  );
}
