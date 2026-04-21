import { useCatalogViewModel } from './use-catalog-viewmodel';
import { BulkAddDialog } from '../bulk-add-dialog/BulkAddDialog';
import { CatalogDetailsCard } from '../catalog-details-card/CatalogDetailsCard';
import { CatalogsCard } from '../catalogs-card/CatalogsCard';
import { CreateCatalogDialog } from '../create-dialog/CreateCatalogDialog';
import { TokensCard } from '../tokens-card/TokensCard';

export function CatalogsPage() {
  const { createDialogOpen, bulkAddDialogOpen } = useCatalogViewModel();

  return (
    <>
      <div className="catalogs-page-grid">
        <div className="catalogs-left-col">
          <CatalogsCard />
          <CatalogDetailsCard />
        </div>
        <div className="catalogs-right-col">
          <TokensCard />
        </div>
      </div>
      {createDialogOpen && <CreateCatalogDialog />}
      {bulkAddDialogOpen && <BulkAddDialog />}
    </>
  );
}
