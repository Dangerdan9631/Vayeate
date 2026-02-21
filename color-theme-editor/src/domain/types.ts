export type ThemeKind = "dark" | "light";

export type ColorHex = `#${string}`;

export interface ColorVariable {
  id: string;
  label: string;
  value: ColorHex;
  role?: "base" | "accent" | "foreground" | "background" | "semantic";
}

export interface ContrastPolicy {
  comment: number;
  keyword: number;
  string: number;
  default: number;
  toolbarMaxContrast: number;
  lightBackgroundMaxContrast: number;
}

export interface ContrastPolicySet {
  dark: ContrastPolicy;
  light: ContrastPolicy;
}

export type ElementTarget = "colors" | "tokenColors" | "semanticTokenColors";

export type BindingStrategy = "raw" | "deriveContrast" | "copyFromDark";

export interface ElementBinding {
  target: ElementTarget;
  key: string;
  variableId?: string;
  strategy: BindingStrategy;
  category?: "comment" | "keyword" | "string" | "default";
}

export interface PaletteEntry {
  id: string;
  hex: ColorHex;
  source: "seed" | "derived";
  tags: string[];
}

export interface PaletteConfig {
  seedVariableIds: string[];
  includeComplementary: boolean;
  includeAnalogous: boolean;
  minDeltaE: number;
}

export interface OutputConfig {
  darkFileName: string;
  lightFileName: string;
  outputDir: string;
}

export interface ThemeTemplate {
  schemaVersion: 1;
  id: string;
  name: string;
  description?: string;
  variables: Record<string, ColorVariable>;
  bindings: ElementBinding[];
  contrastPolicies: ContrastPolicySet;
  palette: PaletteConfig;
  output: OutputConfig;
}

export interface TokenColorRule {
  name?: string;
  scope: string | string[];
  settings: {
    foreground?: string;
    fontStyle?: string;
  };
}

export type SemanticTokenValue =
  | string
  | {
      foreground?: string;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strikethrough?: boolean;
    };

export interface GeneratedTheme {
  name: string;
  type: ThemeKind;
  semanticHighlighting: boolean;
  colors: Record<string, string>;
  tokenColors: TokenColorRule[];
  semanticTokenColors: Record<string, SemanticTokenValue>;
}

export interface GeneratedThemePair {
  dark: GeneratedTheme;
  light: GeneratedTheme;
}

export interface PreviewSample {
  label: string;
  relativePath: string;
  language: string;
}

export interface PreviewSession {
  id: string;
  selectedTemplateId: string;
  samples: PreviewSample[];
  showLight: boolean;
  showDark: boolean;
}