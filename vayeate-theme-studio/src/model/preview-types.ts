/** Document-style preview: language, file name, and tokenized lines. */
export interface TokenizedPreview {
  language: string;
  fileName: string;
  lines: TokenizedPreview.Line[];
}

export namespace TokenizedPreview {
  /** Single token in a tokenized line (text + scope stack). */
  export interface Token {
    text: string;
    scopes: string[];
  }

  /** A line of tokenized tokens. */
  export interface Line {
    tokens: Token[];
  }
}

/** @deprecated Use TokenizedPreview.Token */
export type TokenizedToken = TokenizedPreview.Token;
/** @deprecated Use TokenizedPreview.Line */
export type TokenizedLine = TokenizedPreview.Line;
