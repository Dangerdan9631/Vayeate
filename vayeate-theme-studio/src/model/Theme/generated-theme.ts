/**
 * VS Code `tokenColors` entry grouping scopes with shared text styling.
 */
export interface TokenColorRule {
  name: string;
  scope: string[];
  settings: { foreground?: string; fontStyle?: string };
}

/**
 * Semantic token color value or style override in generated theme JSON.
 */
export interface SemanticTokenValue {
  foreground?: string;
  fontStyle?: string;
  strikethrough?: boolean;
}

/**
 * Complete VS Code color theme produced from a Theme and Template.
 */
export interface GeneratedTheme {
  name: string;
  type: 'dark' | 'light';
  semanticHighlighting: boolean;
  colors: Record<string, string>;
  tokenColors: TokenColorRule[];
  semanticTokenColors: Record<string, string | SemanticTokenValue>;
}
