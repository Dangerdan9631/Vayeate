import type { Catalog } from '../../../model/schemas';
import type { AppStateUpdate } from '../../state/app-state';

export type SetState = (update: AppStateUpdate) => void;

export interface CatalogPaneState {
  catalog: Catalog | null;
  undoMetadata?: { deleteVersionOnRestore?: { name: string; version: string } };
}

export type CatalogUndoPush = (label: string, prev: CatalogPaneState, next: CatalogPaneState) => void;
