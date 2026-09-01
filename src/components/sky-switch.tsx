"use client";

import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { NightSkyBackground } from "~/components/night-sky-background";
import { skySceneFromPath } from "~/lib/sky-scene";
import { cn } from "~/lib/utils";

export function SkySwitch() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const scene = skySceneFromPath(pathname);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setCanAnimate(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className={cn(
          "sky-scene absolute inset-0",
          scene !== null && "is-active",
          !canAnimate && "sky-scene-static"
        )}
      >
        <NightSkyBackground wash={scene === "notes" ? "notes" : "home"} />
      </div>
    </div>
  );
}
