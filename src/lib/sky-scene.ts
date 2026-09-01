export function skySceneFromPath(pathname: string) {
  if (pathname === "/notes" || pathname.startsWith("/notes/")) {
    return "notes" as const;
  }

  if (pathname === "/home" || pathname.startsWith("/home/")) {
    return "home" as const;
  }

  return null;
}

export function skyViewTransitionTypes({
  fromLocation,
  toLocation,
}: {
  fromLocation?: { pathname: string };
  toLocation: { pathname: string };
}) {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return false;
  }

  const from = skySceneFromPath(fromLocation?.pathname ?? "");
  const to = skySceneFromPath(toLocation.pathname);
  if (
    (from === "home" && to === "notes") ||
    (from === "notes" && to === "home")
  ) {
    return ["sky"];
  }

  return false;
}
