import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { singleton } from 'tsyringe';
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

@singleton()
export class UpdateAllCatalogsController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly getCatalogRefs: GetCatalogRefsOperation,
    private readonly loadCatalog: LoadCatalogOperation,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(): Promise<void> {
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, this.templateUiStore.getStore().state.selectedRef);
    const catalogRefs = this.getCatalogRefs.execute();
    if (!template) return;
    const catalogVersionsByName = catalogVersionsByNameFromRefs(catalogRefs);
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const newCatalogRefs: CatalogReference[] = base.catalogRefs.map((ref) => {
      const versions = catalogVersionsByName[ref.name];
      const latest = versions?.[0];
      return latest ? { name: ref.name, version: latest.version } : ref;
    });
    const catalogData: CatalogDataItem[] = [];
    for (const ref of newCatalogRefs) {
      const catalog = await this.loadCatalog.execute(ref.name, ref.version);
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
    const { mappings: newMappings, groupsToEnsure, semanticTokenModifiers, semanticTokenLanguages } =
      mergeMappingsFromCatalogData(catalogData, base.mappings);
    const newGroups = [...(base.groups ?? [])];
    for (const g of groupsToEnsure) {
      if (!newGroups.includes(g)) newGroups.push(g);
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
    this.refreshTemplateRefsAndSelect.execute(updated.name, updated.version, updated);
  }
}
