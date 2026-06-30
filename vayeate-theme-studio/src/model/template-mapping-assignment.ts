import type {
  ColorVariableKey,
  ContrastVariableKey,
  StyleVariableKey,
  TokenType,
} from './schema/primitives';

/** Stable identity for one persisted template mapping. */
export interface TemplateMappingId {
  tokenKey: string;
  tokenType: TokenType;
}

/** Assignment supported by single- and multi-mapping editing workflows. */
export type TemplateMappingAssignment =
  | { kind: 'group'; value: string | null }
  | { kind: 'color'; value: ColorVariableKey | null }
  | { kind: 'contrast'; value: ContrastVariableKey | null }
  | { kind: 'style'; value: StyleVariableKey | null }
  | { kind: 'ignored'; value: boolean };

/** Creates the canonical key used for selection membership. */
export function templateMappingIdKey(id: TemplateMappingId): string {
  return `${id.tokenType}::${id.tokenKey}`;
}
