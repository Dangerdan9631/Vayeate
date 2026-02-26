import type { CatalogName, ColorVariableKey, ContrastVariableKey, TemplateName, Version } from './brands.js';
import type { Token } from './token.js';

export interface CatalogReference {
  readonly name: CatalogName;
  readonly version: Version;
}

export interface ColorVariable {
  readonly key: ColorVariableKey;
}

export interface ContrastVariable {
  readonly key: ContrastVariableKey;
  readonly comparisonSourceRef: ColorVariableKey | null;
}

export interface Mapping {
  readonly token: Token;
  readonly colorVariableRef: ColorVariableKey | null;
  readonly contrastVariableRef: ContrastVariableKey | null;
}

export interface Template {
  readonly name: TemplateName;
  readonly version: Version;
  readonly catalogRefs: readonly CatalogReference[];
  readonly mappings: readonly Mapping[];
  readonly colorVariables: readonly ColorVariable[];
  readonly contrastVariables: readonly ContrastVariable[];
}
