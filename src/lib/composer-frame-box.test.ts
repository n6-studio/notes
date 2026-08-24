import { describe, expect, it } from "vitest";
import { nextComposerFrameBox } from "~/lib/composer-frame-box";

describe("nextComposerFrameBox", () => {
  it("returns the previous box when rounded size is unchanged", () => {
    const prev = { h: 200, rx: 18, w: 480 };
    expect(
      nextComposerFrameBox(prev, { height: 200.4, width: 479.6 }, 18.2)
    ).toBe(prev);
  });

  it("updates when the rounded size actually changes", () => {
    const prev = { h: 200, rx: 18, w: 480 };
    expect(
      nextComposerFrameBox(prev, { height: 201.4, width: 480 }, 18)
    ).toEqual({ h: 201, rx: 18, w: 480 });
  });
});
