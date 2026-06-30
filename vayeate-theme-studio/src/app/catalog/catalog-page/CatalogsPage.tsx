import { useCatalogViewModel } from './use-catalog-viewmodel';
import { BulkAddDialog } from '../bulk-add-dialog/BulkAddDialog';
import { CatalogDetailsCard } from '../catalog-details-card/CatalogDetailsCard';
import { CatalogsCard } from '../catalogs-card/CatalogsCard';
import { CreateCatalogDialog } from '../create-dialog/CreateCatalogDialog';
import { TokensCard } from '../tokens-card/TokensCard';
import { ResizableColumns } from '../../common/resizable-columns/ResizableColumns';

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
        <ResizableColumns
          className="catalogs-page-grid"
          defaultColumns="40% 1fr"
          storageKey="vayeate.catalogs-page-columns"
        >
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
        </ResizableColumns>
      )}
      {createDialogOpen && <CreateCatalogDialog />}
      {bulkAddDialogOpen && <BulkAddDialog />}
    </>
  );
}
