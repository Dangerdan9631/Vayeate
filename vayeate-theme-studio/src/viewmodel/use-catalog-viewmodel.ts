import { useAppState } from '../ui/context/AppContext';

export function useCatalogViewModel() {
  const { state } = useAppState();
  const { created, isCreating } = state.catalogs;

  return {
    catalog: created,
    catalogJson: created ? JSON.stringify(created, null, 2) : null,
    isCreating,
    hasCatalog: created !== null,
  };
}
