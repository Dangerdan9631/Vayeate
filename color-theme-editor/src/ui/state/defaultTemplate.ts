import { DARK_POLICY_DEFAULTS, LIGHT_POLICY_DEFAULTS } from "../../core/contrast-policy";
import type { ThemeTemplate } from "../../domain/types";

export function createDefaultTemplate(): ThemeTemplate {
  return {
    schemaVersion: 1,
    id: "vayeate-template-default",
    name: "Vayeate Studio",
    description: "Default workspace template for Theme Studio",
    variables: {
      background: { id: "background", label: "Editor Background", value: "#1e1e1e", role: "background" },
      foreground: { id: "foreground", label: "Editor Foreground", value: "#d4d4d4", role: "foreground" },
      keyword: { id: "keyword", label: "Keyword", value: "#569cd6", role: "semantic" },
      string: { id: "string", label: "String", value: "#ce9178", role: "semantic" },
      comment: { id: "comment", label: "Comment", value: "#6a9955", role: "semantic" },
      accent: { id: "accent", label: "Accent", value: "#c586c0", role: "accent" },
    },
    bindings: [
      { target: "colors", key: "editor.background", variableId: "background", strategy: "raw", category: "default" },
      { target: "colors", key: "editor.foreground", variableId: "foreground", strategy: "deriveContrast", category: "default" },
      { target: "tokenColors", key: "keyword", variableId: "keyword", strategy: "deriveContrast", category: "keyword" },
      { target: "tokenColors", key: "string", variableId: "string", strategy: "deriveContrast", category: "string" },
      { target: "tokenColors", key: "comment", variableId: "comment", strategy: "deriveContrast", category: "comment" },
      { target: "semanticTokenColors", key: "variable", variableId: "accent", strategy: "deriveContrast", category: "default" },
    ],
    contrastPolicies: {
      dark: { ...DARK_POLICY_DEFAULTS },
      light: { ...LIGHT_POLICY_DEFAULTS },
    },
    palette: {
      seedVariableIds: ["accent", "keyword"],
      includeComplementary: true,
      includeAnalogous: true,
      minDeltaE: 0.06,
    },
    output: {
      darkFileName: "vayeate-color-theme.json",
      lightFileName: "vayeate-light-color-theme.json",
      outputDir: "../themes",
    },
  };
}