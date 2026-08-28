import { setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CaptureTypeSelect } from "~/components/chat-composer";
import type { NoteLabel } from "~/lib/note-label-styles";
import { messages } from "~/locales/en/messages.po";

const EMPTY_SELECT_VALUE = /select-value"[^>]*><\/span>/;
const IGNORE_CAPTURE_TYPE_CHANGE = (_value: NoteLabel) => undefined;

function renderWithEnglish(ui: ReactElement) {
  const i18n = setupI18n();
  i18n.loadAndActivate({ locale: "en", messages });
  return renderToString(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
}

describe("CaptureTypeSelect", () => {
  it("includes the selected label in SSR HTML so the trigger is not blank before hydration", () => {
    const html = renderWithEnglish(
      <CaptureTypeSelect
        onValueChange={IGNORE_CAPTURE_TYPE_CHANGE}
        value="note"
      />
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
