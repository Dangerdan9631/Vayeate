import { describe, expect, it } from "vitest";
import { DARK_POLICY_DEFAULTS, LIGHT_POLICY_DEFAULTS } from "../src/core/contrast-policy";
import type { CatalogSnapshot, ThemeTemplate } from "../src/domain/types";
import { buildCoverageBinding, createMissingCoverageBindings } from "../src/ui/state/bindingCoverage";

function createTemplate(): ThemeTemplate {
  return {
    schemaVersion: 1,
    id: "coverage-test",
    name: "Coverage",
    variables: {
      background: { id: "background", label: "Background", value: "#1e1e1e", role: "background" },
      foreground: { id: "foreground", label: "Foreground", value: "#d4d4d4", role: "foreground" },
      keyword: { id: "keyword", label: "Keyword", value: "#569cd6", role: "semantic" },
      string: { id: "string", label: "String", value: "#ce9178", role: "semantic" },
      comment: { id: "comment", label: "Comment", value: "#6a9955", role: "semantic" },
      accent: { id: "accent", label: "Accent", value: "#c586c0", role: "accent" },
    },
    bindings: [
      { target: "colors", key: "editor.background", variableId: "background", strategy: "raw", category: "default" },
    ],
    contrastPolicies: {
      dark: { ...DARK_POLICY_DEFAULTS },
      light: { ...LIGHT_POLICY_DEFAULTS },
    },
    palette: {
      seedVariableIds: ["accent"],
      includeComplementary: true,
      includeAnalogous: true,
      minDeltaE: 0.06,
    },
    output: {
      darkFileName: "coverage-color-theme.json",
      lightFileName: "coverage-light-color-theme.json",
      outputDir: "../themes",
    },
  };
}

function createSnapshot(): CatalogSnapshot {
  return {
    schemaVersion: 1,
    pinnedVersion: "vscode-catalog-2026-02-21",
    generatedAt: "2026-02-21T00:00:00.000Z",
    source: "merged",
    colorKeys: ["editor.background", "editor.foreground", "activityBar.background"],
    semanticTokenKeys: ["comment", "string", "keyword"],
    textMateScopes: ["comment.line", "keyword.control", "string.quoted"],
  };
}

describe("buildCoverageBinding", () => {
  it("infers strategies and categories for color keys", () => {
    const template = createTemplate();
    const background = buildCoverageBinding("colors", "editor.background", template);
    const foreground = buildCoverageBinding("colors", "editor.foreground", template);
    const activity = buildCoverageBinding("colors", "activityBar.background", template);

    expect(background.strategy).toBe("raw");
    expect(foreground.strategy).toBe("deriveContrast");
    expect(activity.strategy).toBe("raw");
  });

  it("infers token categories", () => {
    const template = createTemplate();
    const comment = buildCoverageBinding("tokenColors", "comment.line", template);
    const keyword = buildCoverageBinding("tokenColors", "keyword.control", template);
    const string = buildCoverageBinding("tokenColors", "string.quoted", template);

    expect(comment.category).toBe("comment");
    expect(keyword.category).toBe("keyword");
    expect(string.category).toBe("string");
  });
});

describe("createMissingCoverageBindings", () => {
  it("returns deterministic missing bindings and counts", () => {
    const template = createTemplate();
    const snapshot = createSnapshot();

    const result = createMissingCoverageBindings(template, snapshot);
    expect(result.counts.colors).toBe(2);
    expect(result.counts.semantic).toBe(3);
    expect(result.counts.token).toBe(3);
    expect(result.bindings[0].key).toBe("activityBar.background");
    expect(result.bindings[result.bindings.length - 1].key).toBe("string.quoted");
  });
});