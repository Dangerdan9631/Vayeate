import { describe, expect, it } from "vitest";
import type { GenerationContext } from "../src/core/generator-v2";
import { generateThemeFromContext } from "../src/core/generator-v2";
import { contrastRatio } from "../src/core/color";
import type { Template_v2, Theme } from "../src/domain/types";

function createTemplate(mappings: Template_v2["mappings"]): Template_v2 {
  return {
    schemaVersion: 2,
    id: "test-template",
    name: "Test Template",
    version: "1.0.0",
    locked: false,
    catalogRefs: [],
    variables: {
      color: [
        { id: "editor-bg", name: "Editor Bg" },
        { id: "editor-fg", name: "Editor Fg" },
        { id: "accent", name: "Accent" },
      ],
      contrast: [{ id: "ratio-default", name: "Ratio Default", targetRatio: 4.5 }],
    },
    mappings,
  };
}

function createTheme(values: Theme["values"]): Theme {
  return {
    schemaVersion: 2,
    id: "test-theme",
    name: "Test Theme",
    templateRef: "test-template@1.0.0",
    values,
    output: {
      darkFileName: "test-dark.json",
      lightFileName: "test-light.json",
      outputDir: "../themes",
    },
  };
}

function createContext(template: Template_v2, theme: Theme): GenerationContext {
  return {
    catalogs: new Map(),
    template,
    theme,
  };
}

describe("generateThemeFromContext (v2)", () => {
  it("derives foreground from color source + contrast ratio instead of emitting ratio value", () => {
    const template = createTemplate([
      { editorKey: "editor.background", target: "colors", variableId: "editor-bg", variableType: "color" },
      { editorKey: "editor.foreground", target: "colors", variableId: "editor-fg", variableType: "color" },
      { editorKey: "editor.foreground", target: "colors", variableId: "ratio-default", variableType: "contrast" },
    ]);

    const theme = createTheme({
      dark: [
        { variableId: "editor-bg", value: "#1e1e1e" },
        { variableId: "editor-fg", value: "#808080" },
        { variableId: "ratio-default", value: "4.5" },
      ],
      light: [
        { variableId: "editor-bg", value: "#f6f6f6" },
        { variableId: "editor-fg", value: "#5a5a5a" },
        { variableId: "ratio-default", value: "4.5" },
      ],
    });

    const generated = generateThemeFromContext(createContext(template, theme), "dark");
    const foreground = generated.colors["editor.foreground"];

    expect(foreground).toMatch(/^#[0-9a-f]{6}$/i);
    expect(foreground).not.toBe("4.5");
    expect(contrastRatio(foreground, generated.colors["editor.background"])).toBeGreaterThanOrEqual(4.5);
  });

  it("skips derivation when no background pair is known for a colors key", () => {
    const template = createTemplate([
      { editorKey: "editor.background", target: "colors", variableId: "editor-bg", variableType: "color" },
      { editorKey: "focusBorder", target: "colors", variableId: "accent", variableType: "color" },
      { editorKey: "focusBorder", target: "colors", variableId: "ratio-default", variableType: "contrast" },
    ]);

    const theme = createTheme({
      dark: [
        { variableId: "editor-bg", value: "#1e1e1e" },
        { variableId: "accent", value: "#888888" },
        { variableId: "ratio-default", value: "7" },
      ],
      light: [
        { variableId: "editor-bg", value: "#f6f6f6" },
        { variableId: "accent", value: "#5a5a5a" },
        { variableId: "ratio-default", value: "7" },
      ],
    });

    const generated = generateThemeFromContext(createContext(template, theme), "dark");
    expect(generated.colors["focusBorder"]).toBe("#888888");
  });

  it("fails generation when a contrast mapping has no paired color source mapping", () => {
    const template = createTemplate([
      { editorKey: "editor.background", target: "colors", variableId: "editor-bg", variableType: "color" },
      { editorKey: "editor.foreground", target: "colors", variableId: "ratio-default", variableType: "contrast" },
    ]);

    const theme = createTheme({
      dark: [
        { variableId: "editor-bg", value: "#1e1e1e" },
        { variableId: "ratio-default", value: "4.5" },
      ],
      light: [
        { variableId: "editor-bg", value: "#f6f6f6" },
        { variableId: "ratio-default", value: "4.5" },
      ],
    });

    expect(() => generateThemeFromContext(createContext(template, theme), "dark")).toThrow(
      /contrast mappings require a paired color mapping source/i,
    );
  });
});
