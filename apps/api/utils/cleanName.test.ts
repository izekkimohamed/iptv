import { describe, expect, it } from "vitest";
import { cleanName } from "./cleanName";

describe("cleanName", () => {
  it("should remove 'XX - ' prefix", () => {
    expect(cleanName("US - Channel Name")).toBe("Channel Name");
  });

  it("should remove 'Prefix - ' prefix", () => {
    expect(cleanName("Some-Prefix - Channel Name")).toBe("Channel Name");
  });

  it("should remove '[xx] - ' prefix case-insensitively", () => {
    expect(cleanName("[us] - Channel Name")).toBe("Channel Name");
  });

  it("should remove content in parentheses", () => {
    expect(cleanName("Channel Name (some content)")).toBe("Channel Name");
  });

  it("should remove pipe-separated prefix and trim whitespace", () => {
    expect(cleanName(" US | Channel Name  ")).toBe("Channel Name");
  });

  it("should handle multiple prefix and parenthesized content removals", () => {
    expect(cleanName("4K-NF - Abstract: The Art of Design (US)")).toBe(
      "Abstract: The Art of Design"
    );
  });

  it("should return cleaned string if no patterns match exactly", () => {
    expect(cleanName("NF - Sleight )")).toBe("Sleight");
  });
});
