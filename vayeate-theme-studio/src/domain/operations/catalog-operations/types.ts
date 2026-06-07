import type { Catalog } from '../../../model/schema/catalog';

export interface CatalogPaneState {
  catalog: Catalog | null;
  undoMetadata?: { deleteVersionOnRestore?: Pick<Catalog, 'name' | 'version'> };
}

export type CatalogUndoPush = (label: string, prev: CatalogPaneState, next: CatalogPaneState) => void;
