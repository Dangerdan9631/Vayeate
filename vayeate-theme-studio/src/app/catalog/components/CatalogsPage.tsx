import { useMemo } from 'react';
import { useCatalogViewModel } from '../viewmodel/use-catalog-viewmodel';
import { useCatalogsState } from '../../app/context/app-context-hooks';
import { BulkAddDialog } from './BulkAddDialog';
import { CatalogDetailsCard } from './CatalogDetailsCard';
import { CatalogsCard } from './CatalogsCard';
import { CreateCatalogDialog } from './CreateCatalogDialog';
import { TokensCard } from './TokensCard';

export function CatalogsPage() {
  const vm = useCatalogViewModel();
  const bulkAddDialogOpen = useCatalogsState().bulkAddDialogOpen;

  const existingTokenKeys = useMemo(() => {
    if (!vm.catalog) return new Set<string>();
    return new Set(vm.catalog.tokens.map((t) => `${t.type}::${t.key}`));
  }, [vm.catalog]);

  return (
    <>
      <div className="catalogs-page-grid">
        <div className="catalogs-left-col">
          <CatalogsCard
            catalogNames={vm.catalogNames}
            selectedName={vm.selectedName}
            versionsForSelectedName={vm.versionsForSelectedName}
            selectedRef={vm.selectedRef}
            onSelectName={vm.selectName}
            onSelectVersion={(version) => {
              if (vm.selectedName) vm.selectCatalog(vm.selectedName, version);
            }}
            onCreateClick={vm.openCreateDialog}
            isCreating={vm.isCreating}
          />
          {vm.catalog && (
            <CatalogDetailsCard
              catalog={vm.catalog}
              tokenCounts={vm.tokenCountsByType}
              isLatestVersion={vm.isLatestVersion}
              onDeleteVersion={() => {
                if (vm.selectedRef) vm.deleteVersion(vm.selectedRef.name, vm.selectedRef.version);
              }}
              onLock={vm.lockCatalog}
              onSync={vm.syncCatalog}
              onRevert={() => {
                if (vm.selectedRef) vm.revertToVersion(vm.selectedRef.name, vm.selectedRef.version);
              }}
            />
          )}
        </div>
        <div className="catalogs-right-col">
          {vm.catalog && (
            <TokensCard
              catalog={vm.catalog}
              tokensByType={vm.tokensByType}
              isLatestVersion={vm.isLatestVersion}
              onAddSemanticFromSelector={vm.addSemanticFromSelector}
              onSetSemanticTypes={vm.setSemanticTypes}
              onSetSemanticModifiers={vm.setSemanticModifiers}
              onSetSemanticLanguages={vm.setSemanticLanguages}
            />
          )}
        </div>
      </div>
      {vm.createDialogOpen && (
        <CreateCatalogDialog
          onCancel={vm.closeCreateDialog}
        />
      )}
      {bulkAddDialogOpen && (
        <BulkAddDialog existingTokenKeys={existingTokenKeys} />
      )}
    </>
  );
}
