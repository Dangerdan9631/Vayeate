import { useEffect, useMemo, useState } from 'react';
import { useTemplateViewModel, computeOrphanKeys } from '../../viewmodel/use-template-viewmodel';
import { catalogService } from '../../services/catalog-service';
import type { Catalog } from '../../model/schemas';
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
  const [semanticCatalog, setSemanticCatalog] = useState<{
    semanticTokenTypes: string[];
    semanticTokenModifiers: string[];
    semanticTokenLanguages: string[];
  } | null>(null);

  useEffect(() => {
    if (!vm.template) {
      setOrphanKeys(new Set());
      setSemanticCatalog(null);
      return;
    }

    let cancelled = false;
    (async () => {
      const allTokens: Token[] = [];
      const typesSet = new Set<string>();
      const modifiersSet = new Set<string>();
      const languagesSet = new Set<string>();
      for (const ref of vm.template!.catalogRefs) {
        const catalog = await catalogService.loadCatalog(ref.name, ref.version) as Catalog | null;
        if (catalog) {
          allTokens.push(...catalog.tokens);
          (catalog.semanticTokenTypes ?? []).forEach((t) => typesSet.add(t));
          (catalog.semanticTokenModifiers ?? []).forEach((m) => modifiersSet.add(m));
          (catalog.semanticTokenLanguages ?? []).forEach((l) => languagesSet.add(l));
        }
      }
      const catalogInfo =
        typesSet.size > 0 || modifiersSet.size > 0 || languagesSet.size > 0
          ? {
              semanticTokenTypes: [...typesSet].sort(),
              semanticTokenModifiers: [...modifiersSet].sort(),
              semanticTokenLanguages: [...languagesSet].sort(),
            }
          : undefined;
      if (!cancelled) {
        setOrphanKeys(computeOrphanKeys(vm.template!.mappings, allTokens, catalogInfo));
        setSemanticCatalog(catalogInfo ?? null);
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
              isLatestVersion={vm.isLatestVersion}
              includedCatalogNamesWithUpdates={vm.includedCatalogNamesWithUpdates}
              onToggleCatalog={vm.toggleCatalog}
              onChangeCatalogVersion={vm.changeCatalogVersion}
              onUpdateAll={vm.updateAllCatalogsToLatest}
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
              semanticCatalog={semanticCatalog}
              onUpdateGroupRef={vm.updateMappingGroupRef}
              onUpdateColorRef={vm.updateMappingColorRef}
              onUpdateContrastRef={vm.updateMappingContrastRef}
              onAddSemanticVariant={vm.addSemanticVariantMapping}
              onRemoveMapping={vm.removeMapping}
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
