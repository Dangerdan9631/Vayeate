import { useCatalogViewModel } from './use-catalog-viewmodel';
import { BulkAddDialog } from '../bulk-add-dialog/BulkAddDialog';
import { CatalogDetailsCard } from '../catalog-details-card/CatalogDetailsCard';
import { CatalogsCard } from '../catalogs-card/CatalogsCard';
import { CreateCatalogDialog } from '../create-dialog/CreateCatalogDialog';
import { TokensCard } from '../tokens-card/TokensCard';

/**
 * Root layout for the Catalogs ribbon tab: picker, details, tokens, and overlay dialogs.
 */
export function CatalogsPage() {
  const {
    isPageLoading,
    isCatalogLoading,
    isCatalogLoaded,
    createDialogOpen,
    bulkAddDialogOpen,
  } = useCatalogViewModel();

  return (
    <>
      {isPageLoading ? (
        <div className="placeholder">
          <h2>Catalogs</h2>
          <p>Loading catalogs...</p>
        </div>
      ) : (
        <div className="catalogs-page-grid">
          <div className="catalogs-left-col">
            <CatalogsCard />
            {isCatalogLoading && (
              <div className="catalog-details-card placeholder">
                <h2>Catalog details</h2>
                <p>Loading catalog...</p>
              </div>
            )}
            {isCatalogLoaded && <CatalogDetailsCard />}
          </div>
          {isCatalogLoaded && (
            <div className="catalogs-right-col">
              <TokensCard />
            </div>
          )}
        </div>
      )}
      {createDialogOpen && <CreateCatalogDialog />}
      {bulkAddDialogOpen && <BulkAddDialog />}
    </>
  );
}
