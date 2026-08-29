import { describe, expect, it } from "vitest";
import {
  inferNoteType,
  singleHttpUrlFromText,
  storedLabelMatchesType,
} from "./note_type";

describe("singleHttpUrlFromText", () => {
  it("accepts an explicit https URL", () => {
    expect(singleHttpUrlFromText("https://example.com")).toBe(
      "https://example.com/"
    );
  });

  it("accepts a host with a dot and adds https", () => {
    expect(singleHttpUrlFromText("example.com/path")).toBe(
      "https://example.com/path"
    );
  });

  it("accepts localhost when the scheme is explicit", () => {
    expect(singleHttpUrlFromText("http://localhost:3000")).toBe(
      "http://localhost:3000/"
    );
  });

  it("rejects a bare hostname without a dot", () => {
    expect(singleHttpUrlFromText("localhost")).toBeUndefined();
  });

  it("rejects text that is not only a URL", () => {
    expect(
      singleHttpUrlFromText("https://example.com see this")
    ).toBeUndefined();
  });

  it("rejects a non-http scheme", () => {
    expect(singleHttpUrlFromText("ftp://example.com")).toBeUndefined();
  });
});

describe("inferNoteType", () => {
  it("defaults to note", () => {
    expect(inferNoteType("buy milk")).toEqual({ label: "note" });
  });

  it("uses url when the whole body is a valid URL", () => {
    expect(inferNoteType("  https://example.com  ")).toEqual({
      label: "url",
      linkUrl: "https://example.com/",
    });
  });
});

describe("storedLabelMatchesType", () => {
  it("treats legacy link rows as url", () => {
    expect(storedLabelMatchesType("link", "url")).toBe(true);
    expect(storedLabelMatchesType("url", "url")).toBe(true);
    expect(storedLabelMatchesType("note", "url")).toBe(false);
  });

  it("treats unlabeled rows as note", () => {
    expect(storedLabelMatchesType(undefined, "note")).toBe(true);
    expect(storedLabelMatchesType("note", "note")).toBe(true);
    expect(storedLabelMatchesType("url", "note")).toBe(false);
  });
});
