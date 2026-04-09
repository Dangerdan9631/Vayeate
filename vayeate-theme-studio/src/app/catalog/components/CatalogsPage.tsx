import { useCatalogViewModel } from '../viewmodel/use-catalog-viewmodel';
import { BulkAddDialog } from './BulkAddDialog';
import { CatalogDetailsCard } from './CatalogDetailsCard';
import { CatalogsCard } from './CatalogsCard';
import { CreateCatalogDialog } from './CreateCatalogDialog';
import { TokensCard } from './TokensCard';

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
