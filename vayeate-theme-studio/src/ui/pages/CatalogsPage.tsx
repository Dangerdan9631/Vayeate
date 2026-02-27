import { useMemo, useState } from 'react';
import { useCatalogViewModel } from '../../viewmodel/use-catalog-viewmodel';
import { BulkAddDialog } from '../components/BulkAddDialog';
import { CatalogDetailsCard } from '../components/CatalogDetailsCard';
import { CatalogsCard } from '../components/CatalogsCard';
import { CreateCatalogDialog } from '../components/CreateCatalogDialog';
import { TokensCard } from '../components/TokensCard';

export function CatalogsPage() {
  const vm = useCatalogViewModel();
  const [bulkAddOpen, setBulkAddOpen] = useState(false);

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
              onUpdateSources={vm.updateSources}
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
              onAddToken={vm.addToken}
              onRemoveToken={vm.removeToken}
              onUpdateTokenKey={vm.updateTokenKey}
              onBulkAdd={() => setBulkAddOpen(true)}
            />
          )}
        </div>
      </div>
      {vm.createDialogOpen && (
        <CreateCatalogDialog
          onCancel={vm.closeCreateDialog}
          onCreate={vm.createCatalog}
        />
      )}
      {bulkAddOpen && (
        <BulkAddDialog
          existingTokenKeys={existingTokenKeys}
          onCancel={() => setBulkAddOpen(false)}
          onAdd={(tokens) => {
            vm.bulkAddTokens(tokens);
            setBulkAddOpen(false);
          }}
        />
      )}
    </>
  );
}
