import type { CatalogType } from '../../../../model/schema/primitives';

export interface CreateCatalogDialogState {
  isOpen: boolean;
  name: string;
  type: CatalogType;
  errorMessage: string | null;
}

export const emptyCreateCatalogData: CreateCatalogDialogState = {
  isOpen: false,
  name: '',
  type: 'manual',
  errorMessage: null,
};
