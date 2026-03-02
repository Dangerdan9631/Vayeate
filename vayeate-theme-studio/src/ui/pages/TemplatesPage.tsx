import { useEffect, useMemo, useState } from 'react';
import { useTemplateViewModel, computeOrphanKeys } from '../../viewmodel/use-template-viewmodel';
import { catalogService } from '../../services/catalog-service';
import { CreateTemplateDialog } from '../components/CreateTemplateDialog';
import { GroupsCard } from '../components/GroupsCard';
import { MappingsCard } from '../components/MappingsCard';
import { TemplateCatalogsCard } from '../components/TemplateCatalogsCard';
import { TemplateDetailsCard } from '../components/TemplateDetailsCard';
import { TemplatesCard } from '../components/TemplatesCard';
import { VariablesCard } from '../components/VariablesCard';
import type { Token } from '../../model/schemas';

export function TemplatesPage() {
  const vm = useTemplateViewModel();
  const [orphanKeys, setOrphanKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!vm.template) {
      setOrphanKeys(new Set());
      return;
    }

    let cancelled = false;
    (async () => {
      const allTokens: Token[] = [];
      for (const ref of vm.template!.catalogRefs) {
        const catalog = await catalogService.loadCatalog(ref.name, ref.version);
        if (catalog) allTokens.push(...catalog.tokens);
      }
      if (!cancelled) {
        setOrphanKeys(computeOrphanKeys(vm.template!.mappings, allTokens));
      }
    })();
    return () => { cancelled = true; };
  }, [vm.template]);

  const canEdit = useMemo(() => {
    return !!vm.template && vm.isLatestVersion;
  }, [vm.template, vm.isLatestVersion]);

  return (
    <>
      <div className="templates-page-grid">
        <div className="templates-left-col">
          <TemplatesCard
            templateNames={vm.templateNames}
            selectedName={vm.selectedName}
            versionsForSelectedName={vm.versionsForSelectedName}
            selectedRef={vm.selectedRef}
            onSelectName={vm.selectName}
            onSelectVersion={(version) => {
              if (vm.selectedName) vm.selectTemplate(vm.selectedName, version);
            }}
            onCreateClick={vm.openCreateDialog}
            isCreating={vm.isCreating}
          />
          {vm.template && (
            <TemplateDetailsCard
              template={vm.template}
              isLatestVersion={vm.isLatestVersion}
              canLock={vm.canLock}
              onDeleteVersion={() => {
                if (vm.selectedRef) vm.deleteVersion(vm.selectedRef.name, vm.selectedRef.version);
              }}
              onLock={vm.lockTemplate}
            />
          )}
          {vm.template && (
            <TemplateCatalogsCard
              catalogNames={vm.catalogNamesList}
              catalogVersionsByName={vm.catalogVersionsByName}
              includedCatalogMap={vm.includedCatalogMap}
              onToggleCatalog={vm.toggleCatalog}
              onChangeCatalogVersion={vm.changeCatalogVersion}
            />
          )}
        </div>
        <div className="templates-center-col">
          {vm.template && (
            <MappingsCard
              mappingsByType={vm.mappingsByType}
              groups={vm.template.groups}
              colorVariables={vm.template.colorVariables}
              contrastVariables={vm.template.contrastVariables}
              orphanKeys={orphanKeys}
              canEdit={canEdit}
              onUpdateGroupRef={vm.updateMappingGroupRef}
              onUpdateColorRef={vm.updateMappingColorRef}
              onUpdateContrastRef={vm.updateMappingContrastRef}
            />
          )}
        </div>
        <div className="templates-right-col">
          {vm.template && (
            <GroupsCard
              groups={vm.template.groups}
              groupNamesInUse={vm.groupNamesInUse}
              canEdit={canEdit}
              onAddGroup={vm.addGroup}
              onRemoveGroup={vm.removeGroup}
            />
          )}
          {vm.template && (
            <VariablesCard
              colorVariables={vm.template.colorVariables}
              contrastVariables={vm.template.contrastVariables}
              groups={vm.template.groups}
              referencedColorVarKeys={vm.referencedColorVarKeys}
              referencedContrastVarKeys={vm.referencedContrastVarKeys}
              canEdit={canEdit}
              onAddColorVariable={vm.addColorVariable}
              onRemoveColorVariable={vm.removeColorVariable}
              onAddContrastVariable={vm.addContrastVariable}
              onRemoveContrastVariable={vm.removeContrastVariable}
              onUpdateColorVariableGroupRef={vm.updateColorVariableGroupRef}
              onUpdateContrastVariableGroupRef={vm.updateContrastVariableGroupRef}
              onUpdateContrastComparisonSource={vm.updateContrastComparisonSource}
            />
          )}
        </div>
      </div>
      {vm.createDialogOpen && (
        <CreateTemplateDialog
          onCancel={vm.closeCreateDialog}
          onCreate={vm.createTemplate}
        />
      )}
    </>
  );
}
