/**
 * Parse and format VS Code semantic token selectors.
 * Format: (*|tokenType)(.tokenModifier)*(:tokenLanguage)?
 * See https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide
 */

export { SEMANTIC_WILDCARD_TYPE } from './semantic-token-constants';
export type { ParsedSemanticSelector, SemanticCatalogArrays } from './semantic-selector-types';
export { parseSemanticSelector } from './parse-semantic-selector';
export { mergeSemanticSelectorInto } from './merge-semantic-selector-into';
export { formatSemanticSelector } from './format-semantic-selector';
