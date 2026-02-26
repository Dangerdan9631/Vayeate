import { useCatalogViewModel } from '../../viewmodel/use-catalog-viewmodel';
import { CatalogDetailsCard } from '../components/CatalogDetailsCard';
import { CatalogsCard } from '../components/CatalogsCard';
import { CreateCatalogDialog } from '../components/CreateCatalogDialog';
import { TokensCard } from '../components/TokensCard';

export function CatalogsPage() {
  const vm = useCatalogViewModel();

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
    </>
  );
}
