import { describe, expect, it } from "vitest";
import { contrastRatio, deltaEok } from "../src/core/color";
import { DARK_POLICY_DEFAULTS, LIGHT_POLICY_DEFAULTS, semanticTarget, tokenTarget } from "../src/core/contrast-policy";
import { assertValidThemeFileName } from "../src/core/exporter";
import { resolveOutputDirectory } from "../src/core/exporter";
import { stableStringify } from "../src/core/json";
import { filterByPerceptualDistance } from "../src/core/palette";

describe("stableStringify", () => {
  it("sorts keys recursively and emits trailing newline", () => {
    const output = stableStringify({ b: 1, a: { z: 2, y: 1 } });
    expect(output).toBe('{\n  "a": {\n    "y": 1,\n    "z": 2\n  },\n  "b": 1\n}\n');
  });
});

describe("contrast policy split", () => {
  it("uses stricter dark keyword threshold and lighter comment threshold for light mode", () => {
    expect(tokenTarget("keyword.operator", "dark", DARK_POLICY_DEFAULTS)).toBe(6);
    expect(tokenTarget("comment.line", "light", LIGHT_POLICY_DEFAULTS)).toBe(1.5);
    expect(semanticTarget("string", LIGHT_POLICY_DEFAULTS)).toBe(4);
  });
});

describe("palette distance", () => {
  it("filters visually close colors using min DeltaE", () => {
    const colors = ["#336699", "#33679a", "#ff8800"];
    const filtered = filterByPerceptualDistance(colors, 0.02);
    expect(filtered.length).toBeLessThan(colors.length);
  });

  it("computes positive OKLab distance for different colors", () => {
    expect(deltaEok("#000000", "#ffffff")).toBeGreaterThan(0);
  });
});

describe("filename validation", () => {
  it("accepts valid naming convention", () => {
    expect(() => assertValidThemeFileName("vayeate-light-color-theme.json")).not.toThrow();
  });

  it("rejects invalid naming convention", () => {
    expect(() => assertValidThemeFileName("../bad.json")).toThrow();
  });
});

describe("output directory boundary", () => {
  it("allows output within themes directory", () => {
    const resolved = resolveOutputDirectory("D:/repo/color-theme-editor", "../themes");
    expect(resolved.endsWith("/repo/themes") || resolved.endsWith("\\repo\\themes")).toBe(true);
  });

  it("rejects output paths outside themes directory", () => {
    expect(() => resolveOutputDirectory("D:/repo/color-theme-editor", "../scripts")).toThrow();
  });
});

describe("contrast function", () => {
  it("returns 21:1 for white on black", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
  });
});