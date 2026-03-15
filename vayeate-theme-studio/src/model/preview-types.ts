/** Single token in a tokenized line (text + scope stack). */
export interface TokenizedToken {
  text: string;
  scopes: string[];
}

/** A line of tokenized tokens. */
export interface TokenizedLine {
  tokens: TokenizedToken[];
}

/** A preview file tokenized by language (used by editor previews). */
export interface TokenizedPreview {
  language: string;
  fileName: string;
  lines: TokenizedLine[];
}
