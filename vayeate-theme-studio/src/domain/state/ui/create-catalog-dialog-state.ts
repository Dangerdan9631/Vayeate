import type { CatalogType } from '../../../model/schema/primitives';

/**
 * In-progress fields for the create-catalog dialog.
 */
export interface CreateCatalogDialogState {
  isOpen: boolean;
  name: string;
  type: CatalogType;
  errorMessage: string | null;
}

/**
 * Default create-catalog dialog data used when opening a new dialog session.
 */
export const emptyCreateCatalogData: CreateCatalogDialogState = {
  isOpen: false,
  name: '',
  type: 'manual',
  errorMessage: null,
};
