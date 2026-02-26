import type { Token } from './token.js';

export interface ColorVariable {
  readonly key: string;
}

export interface ContrastVariable {
  readonly key: string;
  readonly comparisonSourceKey: string | null;
}

export interface Mapping {
  readonly token: Token;
  readonly colorKey: string | null;
  readonly contrastKey: string | null;
}

export interface Template {
  readonly name: string;
  readonly version: string;
  readonly catalogRefKeys: readonly string[];
  readonly mappings: readonly Mapping[];
  readonly colorVariables: readonly ColorVariable[];
  readonly contrastVariables: readonly ContrastVariable[];
}
