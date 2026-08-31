"use client";

import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { NightSkyBackground } from "~/components/night-sky-background";
import { NotesSkyBackground } from "~/components/notes-sky-background";
import { cn } from "~/lib/utils";

function sceneFromPath(pathname: string) {
  if (pathname === "/notes" || pathname.startsWith("/notes/")) {
    return "notes" as const;
  }

  if (pathname === "/home" || pathname.startsWith("/home/")) {
    return "home" as const;
  }

  return null;
}

export function SkySwitch() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const scene = sceneFromPath(pathname);
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
          scene === "home" && "is-active",
          !canAnimate && "sky-scene-static"
        )}
      >
        <NightSkyBackground />
      </div>
      <div
        className={cn(
          "sky-scene absolute inset-0",
          scene === "notes" && "is-active",
          !canAnimate && "sky-scene-static"
        )}
      >
        <NotesSkyBackground />
      </div>
    </div>
  );
}
