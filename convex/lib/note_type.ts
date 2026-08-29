export const INFERRED_NOTE_TYPES = ["note", "url"] as const;
export type InferredNoteType = (typeof INFERRED_NOTE_TYPES)[number];

const HAS_WHITESPACE = /\s/;

/** If the whole trimmed message is one http(s) URL, return normalized href; else undefined. */
export function singleHttpUrlFromText(text: string): string | undefined {
  const trimmed = text.trim();
  if (!trimmed || HAS_WHITESPACE.test(trimmed)) {
    return;
  }
  const withScheme =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return;
    }
    // Require a dot in hostname unless the user included an explicit scheme (e.g. http://localhost).
    const host = url.hostname;
    if (
      !(
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        host.includes(".")
      )
    ) {
      return;
    }
    return url.href;
  } catch (error) {
    if (error instanceof TypeError) {
      return;
    }
    throw error;
  }
}

export function inferNoteType(body: string): {
  label: InferredNoteType;
  linkUrl?: string;
} {
  const linkUrl = singleHttpUrlFromText(body);
  if (linkUrl === undefined) {
    return { label: "note" };
  }
  return { label: "url", linkUrl };
}

/** List-filter match: `url` includes legacy stored `link`; `note` includes unlabeled rows. */
export function storedLabelMatchesType(
  stored: string | undefined,
  type: InferredNoteType
): boolean {
  if (type === "url") {
    return stored === "url" || stored === "link";
  }
  return stored === "note" || stored === undefined;
}
