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
  preview?: PreviewSession;
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
  id: string;
  label: string;
  relativePath: string;
  language: string;
}

export interface PreviewSession {
  id: string;
  samples: PreviewSample[];
  showLight: boolean;
  showDark: boolean;
}

export interface GeneratedOutputSummaryItem {
  fileName: string;
  targetPath: string;
  exists: boolean;
  beforeBytes: number;
  afterBytes: number;
  changed: boolean;
  themeType: ThemeKind;
}

export interface GeneratedOutputSummary {
  dark: GeneratedOutputSummaryItem;
  light: GeneratedOutputSummaryItem;
  tokenCount: {
    dark: number;
    light: number;
  };
  colorCount: {
    dark: number;
    light: number;
  };
}

export interface ThemeTemplateWithPreview extends ThemeTemplate {
  preview: PreviewSession;
}

export interface CatalogPin {
  schemaVersion: 1;
  pinnedVersion: string;
  updatePolicy: "manual" | "scheduled";
  sources: {
    themeColorRegistryUrl: string;
    semanticTokenRegistryUrl: string;
    scopeGuidanceUrl: string;
  };
}

export interface CatalogSnapshot {
  schemaVersion: 1;
  pinnedVersion: string;
  generatedAt: string;
  source: "local" | "remote" | "merged";
  colorKeys: string[];
  semanticTokenKeys: string[];
  textMateScopes: string[];
}

export interface CatalogRemoteSnapshot {
  schemaVersion: 1;
  pinnedVersion: string;
  fetchedAt: string;
  sourceUrls: CatalogPin["sources"];
  colorKeys: string[];
  semanticTokenKeys: string[];
  textMateScopes: string[];
}

export interface CatalogValidationIssue {
  code: string;
  severity: "warning" | "error";
  message: string;
}

export interface CatalogValidationReport {
  valid: boolean;
  issues: CatalogValidationIssue[];
  stats: {
    colorKeyCount: number;
    semanticTokenKeyCount: number;
    textMateScopeCount: number;
    remoteColorKeyCount: number;
    remoteSemanticTokenKeyCount: number;
    remoteTextMateScopeCount: number;
    localOnlyColorKeys: number;
    localOnlySemanticTokenKeys: number;
    localOnlyTextMateScopes: number;
    remoteOnlyColorKeys: number;
    remoteOnlySemanticTokenKeys: number;
    remoteOnlyTextMateScopes: number;
  };
}

export interface CatalogSyncResult {
  snapshot: CatalogSnapshot;
  remoteSnapshot: CatalogRemoteSnapshot | null;
  report: CatalogValidationReport;
}

// ============================================================================
// NEW DATA MODEL (v2)
// ============================================================================

export type CatalogSource = "remote" | "manual";

export interface Catalog {
  schemaVersion: 2;
  name: string;
  version: string;
  source: CatalogSource;
  locked?: boolean;
  sources?: {
    themeColorRegistryUrl?: string;
    semanticTokenRegistryUrl?: string;
    scopeGuidanceUrl?: string;
  };
  keys: {
    colors: string[];
    semanticTokens: string[];
    textMateScopes: string[];
  };
}

export type VariableType = "color" | "contrast";

export interface ColorVariable_v2 {
  id: string;
  name: string;
}

export interface ContrastVariable {
  id: string;
  name: string;
  targetRatio: number;
}

export type CatalogTarget = "colors" | "semanticTokens" | "textMateScopes";

export interface VariableMapping {
  editorKey: string;
  target: CatalogTarget;
  variableId: string;
  variableType: VariableType;
}

export interface Template_v2 {
  schemaVersion: 2;
  id: string;
  name: string;
  version: string;
  locked: boolean;
  description?: string;
  catalogRefs: string[];
  variables: {
    color: ColorVariable_v2[];
    contrast: ContrastVariable[];
  };
  mappings: VariableMapping[];
}

export type ThemeVariableValue = ColorHex | "useDark";

export interface ThemeVariableAssignment {
  variableId: string;
  value: ThemeVariableValue;
}

export interface Theme {
  schemaVersion: 2;
  id: string;
  name: string;
  templateRef: string;
  values: {
    dark: ThemeVariableAssignment[];
    light: ThemeVariableAssignment[];
  };
  output: {
    darkFileName: string;
    lightFileName: string;
    outputDir: string;
  };
}

export interface CatalogSyncOptions {
  syncRemote: boolean;
  updateVersion: boolean;
}

export interface CatalogAddKeyRequest {
  target: CatalogTarget;
  key: string;
}

export interface CatalogRemoveKeyRequest {
  target: CatalogTarget;
  key: string;
}