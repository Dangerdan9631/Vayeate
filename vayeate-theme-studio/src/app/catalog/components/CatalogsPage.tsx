import { useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useCatalogViewModel } from '../viewmodel/use-catalog-viewmodel';
import { AppContext } from '../../core/components/AppProvider';
import { BulkAddDialog } from './BulkAddDialog';
import { CatalogDetailsCard } from './CatalogDetailsCard';
import { CatalogsCard } from './CatalogsCard';
import { CreateCatalogDialog } from './CreateCatalogDialog';
import { TokensCard } from './TokensCard';
import type { Token } from '../../../model/schemas';

export function CatalogsPage() {
  useCatalogViewModel();
  const { catalog, createDialogOpen, bulkAddDialogOpen } = useContextSelector(AppContext, (c) => {
    const slice = c?.state.catalogs;
    if (slice === undefined) {
      throw new Error('Catalog state requires AppProvider.');
    }
    return slice;
  });

  const existingTokenKeys = useMemo(() => {
    if (!catalog) return new Set<string>();
    return new Set(catalog.tokens.map((t: Token) => `${t.type}::${t.key}`));
  }, [catalog]);

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
      {bulkAddDialogOpen && (
        <BulkAddDialog existingTokenKeys={existingTokenKeys as Set<string>} />
      )}
    </>
  );
}
