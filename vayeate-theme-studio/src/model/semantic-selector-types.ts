export interface ParsedSemanticSelector {
  type: string;
  modifiers: string[];
  language: string | null;
}

export interface SemanticCatalogArrays {
  types: readonly string[];
  modifiers: readonly string[];
  languages: readonly string[];
}
