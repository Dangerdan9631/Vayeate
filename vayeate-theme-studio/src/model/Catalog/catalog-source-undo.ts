/**
 * Field-level catalog source undo payload for granular replay.
 */
export interface CatalogSourceFieldUndoValue {
  sourceIndex: number;
  field: 'url';
  value: string;
}
