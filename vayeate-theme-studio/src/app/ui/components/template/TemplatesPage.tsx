import { useEffect, useMemo, useState } from 'react';
import {
  useTemplateViewModel,
  computeOrphanKeys,
  type SemanticCatalogInfo,
} from '../../../viewmodel/use-template-viewmodel';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { GroupsCard } from './GroupsCard';
import { MappingsCard } from './MappingsCard';
import { TemplateCatalogsCard } from './TemplateCatalogsCard';
import { TemplateDetailsCard } from './TemplateDetailsCard';
import { TemplatesCard } from './TemplatesCard';
import { VariablesCard } from './VariablesCard';
import type { Token } from '../../../../model/schemas';

export function TemplatesPage() {
  const vm = useTemplateViewModel();
  const [orphanKeys, setOrphanKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!vm.template || vm.loadedCatalogsForTemplateRefs.length === 0) {
      setOrphanKeys(new Set());
      return;
    }
    const loaded = vm.loadedCatalogsForTemplateRefs;
    const allLoaded = loaded.every((c) => c !== null);
    if (!allLoaded) return;

    const allTokens: Token[] = [];
    const typesSet = new Set<string>();
    const modifiersSet = new Set<string>();
    const languagesSet = new Set<string>();
    for (const catalog of loaded) {
      if (catalog) {
        allTokens.push(...catalog.tokens);
        (catalog.semanticTokenTypes ?? []).forEach((t) => typesSet.add(t));
        (catalog.semanticTokenModifiers ?? []).forEach((m) => modifiersSet.add(m));
        (catalog.semanticTokenLanguages ?? []).forEach((l) => languagesSet.add(l));
      }
    }
    const semanticCatalog: SemanticCatalogInfo | undefined =
      typesSet.size > 0 || modifiersSet.size > 0 || languagesSet.size > 0
        ? {
            semanticTokenTypes: [...typesSet].sort(),
            semanticTokenModifiers: [...modifiersSet].sort(),
            semanticTokenLanguages: [...languagesSet].sort(),
          }
        : undefined;
    setOrphanKeys(computeOrphanKeys(vm.template.mappings, allTokens, semanticCatalog));
  }, [vm.template, vm.loadedCatalogsForTemplateRefs]);

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
              semanticVariant={{
                semanticTokenModifiers: vm.template.semanticTokenModifiers ?? [],
                semanticTokenLanguages: vm.template.semanticTokenLanguages ?? [],
                onAddSemanticVariant: vm.addSemanticVariantMapping,
                onUpdateSemanticVariantKey: vm.updateSemanticVariantKey,
              }}
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
        />
      )}
    </>
  );
}
