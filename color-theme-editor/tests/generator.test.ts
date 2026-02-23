import { describe, expect, it } from "vitest";
import { generateThemePair } from "../src/core/generator";
import { DARK_POLICY_DEFAULTS, LIGHT_POLICY_DEFAULTS } from "../src/core/contrast-policy";
import { contrastRatio } from "../src/core/color";
import { stableStringify } from "../src/core/json";
import type { ThemeTemplate } from "../src/domain/types";

function createTemplate(): ThemeTemplate {
  return {
    schemaVersion: 1,
    id: "test-theme",
    name: "Test Theme",
    variables: {
      background: { id: "background", label: "Background", value: "#1e1e1e", role: "background" },
      foreground: { id: "foreground", label: "Foreground", value: "#d4d4d4", role: "foreground" },
      keyword: { id: "keyword", label: "Keyword", value: "#569cd6", role: "semantic" },
      string: { id: "string", label: "String", value: "#ce9178", role: "semantic" },
    },
    bindings: [
      { target: "colors", key: "editor.background", variableId: "background", strategy: "raw", category: "default" },
      {
        target: "colors",
        key: "activityBar.background",
        variableId: "foreground",
        strategy: "raw",
        category: "default",
      },
      { target: "colors", key: "editor.foreground", variableId: "foreground", strategy: "copyFromDark", category: "default" },
      { target: "tokenColors", key: "keyword", variableId: "keyword", strategy: "copyFromDark", category: "keyword" },
      {
        target: "semanticTokenColors",
        key: "string",
        variableId: "string",
        strategy: "copyFromDark",
        category: "string",
      },
    ],
    contrastPolicies: {
      dark: { ...DARK_POLICY_DEFAULTS },
      light: { ...LIGHT_POLICY_DEFAULTS },
    },
    palette: {
      seedVariableIds: ["keyword"],
      includeComplementary: true,
      includeAnalogous: true,
      minDeltaE: 0.06,
    },
    output: {
      darkFileName: "test-color-theme.json",
      lightFileName: "test-light-color-theme.json",
      outputDir: "../themes",
    },
  };
}

describe("generateThemePair", () => {
  it("copies configured light bindings from dark output", () => {
    const generated = generateThemePair(createTemplate());
    expect(generated.light.colors["editor.foreground"]).toBe(generated.dark.colors["editor.foreground"]);

    const darkKeyword = generated.dark.tokenColors.find((entry) => entry.name === "keyword")?.settings.foreground;
    const lightKeyword = generated.light.tokenColors.find((entry) => entry.name === "keyword")?.settings.foreground;
    expect(lightKeyword).toBe(darkKeyword);

    const darkString = generated.dark.semanticTokenColors.string;
    const lightString = generated.light.semanticTokenColors.string;
    expect(lightString).toBe(darkString);
  });

  it("keeps raw background binding unchanged", () => {
    const generated = generateThemePair(createTemplate());
    expect(generated.dark.colors["editor.background"]).toBe("#1e1e1e");
  });

  it("is byte-stable for same template inputs", () => {
    const template = createTemplate();
    const first = generateThemePair(template);
    const second = generateThemePair(template);

    expect(stableStringify(first.dark)).toBe(stableStringify(second.dark));
    expect(stableStringify(first.light)).toBe(stableStringify(second.light));
  });

  it("caps dark toolbar backgrounds to max contrast vs editor background", () => {
    const generated = generateThemePair(createTemplate());
    const ratio = contrastRatio(
      generated.dark.colors["activityBar.background"],
      generated.dark.colors["editor.background"],
    );
    expect(ratio).toBeLessThanOrEqual(DARK_POLICY_DEFAULTS.toolbarMaxContrast + 0.05);
  });
});