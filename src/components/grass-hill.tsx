import { useLingui } from "@lingui/react/macro";
import { cn } from "~/lib/utils";

const VIEW_W = 1600;
const VIEW_H = 220;
const RIDGE_STEPS = 96;

interface HillPeak {
  at: number;
  lift: number;
  spread: number;
}

interface HillScene {
  bodyId: string;
  edgeLift: number;
  fills: {
    back: string;
    body: [string, string, string];
    front: string;
    ridge: string;
  };
  peaks: HillPeak[];
  seeds: {
    back: number;
    body: number;
    front: number;
    ridge: number;
  };
}

const HOME_SCENE: HillScene = {
  bodyId: "grass-hill-body",
  edgeLift: 22,
  fills: {
    back: "oklch(0.34 0.09 148)",
    body: [
      "oklch(0.42 0.1 148)",
      "oklch(0.34 0.08 147)",
      "oklch(0.27 0.062 150)",
    ],
    front: "oklch(0.27 0.078 150)",
    ridge: "oklch(0.3 0.085 148)",
  },
  peaks: [{ at: 0.5, lift: 82, spread: 0.46 }],
  seeds: { back: 11, body: 7, front: 29, ridge: 19 },
};

const NOTES_SCENE: HillScene = {
  bodyId: "grass-hill-notes-body",
  edgeLift: 18,
  fills: {
    back: "oklch(0.31 0.078 166)",
    body: [
      "oklch(0.38 0.085 165)",
      "oklch(0.3 0.07 168)",
      "oklch(0.24 0.055 170)",
    ],
    front: "oklch(0.24 0.065 170)",
    ridge: "oklch(0.27 0.072 168)",
  },
  peaks: [
    { at: 0.2, lift: 58, spread: 0.2 },
    { at: 0.74, lift: 72, spread: 0.24 },
  ],
  seeds: { back: 43, body: 41, front: 53, ridge: 47 },
};

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

function hillY(x: number, scene: HillScene) {
  let lift = 0;
  for (const peak of scene.peaks) {
    const t = (x / VIEW_W - peak.at) / peak.spread;
    lift += peak.lift * Math.exp(-0.5 * t * t);
  }
  return VIEW_H - scene.edgeLift - lift;
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

function buildHillBody(scene: HillScene) {
  const rng = createRng(scene.seeds.body);
  let d = `M0 ${VIEW_H}`;

  for (let i = 0; i <= RIDGE_STEPS; i += 1) {
    const x = (i / RIDGE_STEPS) * VIEW_W;
    const jitter = (rng() - 0.5) * 1.6;
    d += `L${svgCoord(x)} ${svgCoord(hillY(x, scene) + jitter)}`;
  }

  d += `L${VIEW_W} ${VIEW_H}Z`;
  return d;
}

function buildGrass(
  scene: HillScene,
  options: {
    count: number;
    halfW: [number, number];
    height: [number, number];
    lean: number;
    plant: number;
    seed: number;
    tuftSpread: number;
  }
) {
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

      const ridge = hillY(x, scene);
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

function buildHillDrawing(scene: HillScene) {
  return {
    backGrass: buildGrass(scene, {
      count: 280,
      halfW: [0.32, 0.78],
      height: [20, 44],
      lean: 0.56,
      plant: 5,
      seed: scene.seeds.back,
      tuftSpread: 12,
    }),
    body: buildHillBody(scene),
    frontGrass: buildGrass(scene, {
      count: 80,
      halfW: [0.36, 0.95],
      height: [8, 20],
      lean: 0.34,
      plant: 32,
      seed: scene.seeds.front,
      tuftSpread: 11,
    }),
    ridgeGrass: buildGrass(scene, {
      count: 360,
      halfW: [0.24, 0.64],
      height: [14, 34],
      lean: 0.48,
      plant: 4,
      seed: scene.seeds.ridge,
      tuftSpread: 9,
    }),
    scene,
  };
}

const HOME_HILL = buildHillDrawing(HOME_SCENE);
const NOTES_HILL = buildHillDrawing(NOTES_SCENE);

function GrassHillScene({
  className,
  drawing,
}: {
  className?: string;
  drawing: typeof HOME_HILL;
}) {
  const { t } = useLingui();
  const { scene } = drawing;

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "sky-scene-hill pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[min(11vh,6.25rem)] w-full md:h-[min(20vh,10.5rem)]",
        className
      )}
      preserveAspectRatio="none"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
    >
      <title>{t`Decorative grass hill`}</title>
      <defs>
        <linearGradient
          gradientUnits="objectBoundingBox"
          id={scene.bodyId}
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop offset="0" stopColor={scene.fills.body[0]} />
          <stop offset="0.5" stopColor={scene.fills.body[1]} />
          <stop offset="1" stopColor={scene.fills.body[2]} />
        </linearGradient>
      </defs>
      <path d={drawing.body} fill={`url(#${scene.bodyId})`} />
      <path d={drawing.backGrass} fill={scene.fills.back} />
      <path d={drawing.ridgeGrass} fill={scene.fills.ridge} />
      <path d={drawing.frontGrass} fill={scene.fills.front} />
    </svg>
  );
}

export function GrassHill() {
  return <GrassHillScene drawing={HOME_HILL} />;
}

export function NotesGrassHill() {
  return <GrassHillScene drawing={NOTES_HILL} />;
}
