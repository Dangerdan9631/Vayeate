/**
 * Re-export semantic token selector parsing from model for domain/app use.
 */
export {
  SEMANTIC_WILDCARD_TYPE,
  parseSemanticSelector,
  mergeSemanticSelectorInto,
  formatSemanticSelector,
  type ParsedSemanticSelector,
  type SemanticCatalogArrays,
} from '../../model/semantic-token';
