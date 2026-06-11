/**
 * Single token in a tokenized line (text + scope stack).
 */
export interface TokenizedPreviewToken {
  text: string;
  scopes: string[];
}

/**
 * A line of tokenized tokens.
 */
export interface TokenizedPreviewLine {
  tokens: TokenizedPreviewToken[];
}

/**
 * Document-style preview: language, file name, and tokenized lines.
 */
export interface TokenizedPreview {
  language: string;
  fileName: string;
  lines: TokenizedPreviewLine[];
}

/**
 * @deprecated Use TokenizedPreviewToken
 */
export type TokenizedToken = TokenizedPreviewToken;
/**
 * @deprecated Use TokenizedPreviewLine
 */
export type TokenizedLine = TokenizedPreviewLine;
