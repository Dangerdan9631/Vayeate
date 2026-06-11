import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/data/templates-store';
import { GetCatalogRefsOperation } from '../../../../domain/operations/delete/get-catalog-refs-operation';
import { LoadCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/load-catalog-operation';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import {
  mergeMappingsFromCatalogData,
  type CatalogDataItem,
} from '../../../../domain/utils/template-catalog-merge';
import { catalogVersionsByNameFromRefs } from '../../../../domain/utils/catalog-versions-by-name-from-refs';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordTemplateUndoOperation } from '../../../../domain/operations/undo-operations/record-template-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/undo-history';
import { TEMPLATE_CATALOG_TOGGLED } from '../../../../model/undo-action-types';

async function loadCatalogData(
  loadCatalog: LoadCatalogOperation,
  refs: readonly { name: string; version: string }[],
): Promise<CatalogDataItem[]> {
  const catalogData: CatalogDataItem[] = [];
  for (const ref of refs) {
    const catalog = await loadCatalog.execute(ref.name, ref.version);
    if (catalog) {
      catalogData.push({
        ref,
        tokens: catalog.tokens,
        semanticTokenTypes: catalog.semanticTokenTypes,
        semanticTokenModifiers: catalog.semanticTokenModifiers,
        semanticTokenLanguages: catalog.semanticTokenLanguages,
      });
    }
  }
  return catalogData;
}

/**
 * Handles TEMPLATE_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE by including or excluding a catalog.
 */
@singleton()
export class ToggleCatalogController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly getCatalogRefs: GetCatalogRefsOperation,
    private readonly loadCatalog: LoadCatalogOperation,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly recordTemplateUndo: RecordTemplateUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Toggles catalog inclusion for the selected template and records undo.
   * @param catalogName Catalog name from the checkbox toggle.
   * @returns Resolves when the template update and persist finish.
   */
  async run(catalogName: string): Promise<void> {
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, this.templateUiStore.getStore().state.selectedRef);
    const catalogRefs = this.getCatalogRefs.execute();
    if (!template) return;
    const currentlyIncluded = template.catalogRefs.some((r) => r.name === catalogName);
    const include = !currentlyIncluded;
    const catalogVersionsByName = catalogVersionsByNameFromRefs(catalogRefs);

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'templates',
      templateRef: { name: template.name, version: template.version },
      catalogRef: this.catalogUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    const base = this.bumpTemplateVersionForEdit.execute(template);
    let newCatalogRefs: { name: string; version: string }[];
    if (include) {
      const versions = catalogVersionsByName[catalogName];
      if (!versions || versions.length === 0) return;
      const highestVersion = versions[0].version;
      newCatalogRefs = [...base.catalogRefs, { name: catalogName, version: highestVersion }];
    } else {
      newCatalogRefs = base.catalogRefs.filter((r) => r.name !== catalogName);
    }
    const catalogData = await loadCatalogData(this.loadCatalog, newCatalogRefs);
    const { mappings: newMappings, groupsToEnsure, semanticTokenModifiers, semanticTokenLanguages } =
      mergeMappingsFromCatalogData(catalogData, base.mappings);
    let newGroups: string[];
    if (include) {
      newGroups = [...(base.groups ?? [])];
      for (const g of groupsToEnsure) {
        if (!newGroups.includes(g)) newGroups.push(g);
      }
    } else {
      const groupNamesInUseAfter = new Set<string>();
      for (const m of newMappings) {
        if (m.groupRef) groupNamesInUseAfter.add(m.groupRef);
      }
      for (const v of base.colorVariables) {
        if (v.groupRef) groupNamesInUseAfter.add(v.groupRef);
      }
      for (const v of base.contrastVariables) {
        if (v.groupRef) groupNamesInUseAfter.add(v.groupRef);
      }
      newGroups = (base.groups ?? []).filter(
        (g) => g !== catalogName || groupNamesInUseAfter.has(g),
      );
    }
    const updated = {
      ...base,
      catalogRefs: newCatalogRefs,
      mappings: newMappings,
      groups: newGroups,
      semanticTokenModifiers,
      semanticTokenLanguages,
    };
    this.saveTemplate.execute(updated);
    this.refreshTemplateRefsAndSelect.execute(updated.name, updated.version, updated, entityRefsChanged(template, updated));

    await this.recordTemplateUndo.execute({
      description: include ? `Include catalog ${catalogName}` : `Exclude catalog ${catalogName}`,
      actionType: TEMPLATE_CATALOG_TOGGLED,
      target: `${template.name}@${template.version}:catalog:${catalogName}`,
      before: template,
      after: updated,
    });
  }
}
