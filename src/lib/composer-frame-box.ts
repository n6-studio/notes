export interface ComposerFrameBox {
  h: number;
  rx: number;
  w: number;
}

/** Round overlay measurements so subpixel ResizeObserver chatter cannot setState forever. */
export function nextComposerFrameBox(
  prev: ComposerFrameBox,
  rect: { height: number; width: number },
  borderRadius: number
): ComposerFrameBox {
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);
  const rx = Number.isFinite(borderRadius) ? Math.round(borderRadius) : prev.rx;
  if (prev.w === w && prev.h === h && prev.rx === rx) {
    return prev;
  }
  return { h, rx, w };
}
