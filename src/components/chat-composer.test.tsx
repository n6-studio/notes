import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CaptureTypeSelect } from "~/components/chat-composer";

const EMPTY_SELECT_VALUE = /select-value"[^>]*><\/span>/;

describe("CaptureTypeSelect", () => {
  it("includes the selected label in SSR HTML so the trigger is not blank before hydration", () => {
    const html = renderToString(
      <CaptureTypeSelect onValueChange={() => undefined} value="note" />
    );
    const valueStart = html.indexOf('data-slot="select-value"');
    expect(valueStart).toBeGreaterThan(-1);
    const valueChunk = html.slice(
      valueStart,
      html.indexOf("</button>", valueStart)
    );
    expect(valueChunk.toLowerCase()).toContain("note");
    expect(valueChunk).not.toMatch(EMPTY_SELECT_VALUE);
  });
});
