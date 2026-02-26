import { useAppState } from '../context/AppContext';
import { useCatalogViewModel } from '../../viewmodel/use-catalog-viewmodel';

export function CatalogsPage() {
  const { dispatch } = useAppState();
  const { hasCatalog, catalogJson, isCreating } = useCatalogViewModel();

  return (
    <section className="placeholder">
      <h1>Catalogs</h1>
      {!hasCatalog ? (
        <button
          type="button"
          className="create-catalog-btn"
          disabled={isCreating}
          onClick={() => dispatch({ type: 'CREATE_CATALOG' })}
        >
          {isCreating ? 'Creating...' : 'Create Catalog'}
        </button>
      ) : (
        <textarea
          className="catalog-json-view"
          readOnly
          value={catalogJson ?? ''}
          rows={20}
        />
      )}
    </section>
  );
}
