import type { CatalogReference } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import { GetCatalogRefs, LoadCatalogSnapshot } from '../../../operations/catalog-operations';
import {
  BumpTemplateVersionForEdit,
  SaveTemplate,
} from '../../../operations/template-operations';
import {
  mergeMappingsFromCatalogData,
  type CatalogDataItem,
} from '../../../utils/template-catalog-merge';
import { catalogVersionsByNameFromRefs } from '../../../utils/template-utils';
import { TemplateSharedFlows } from '../shared-flows';

async function loadCatalogData(
  loadCatalogSnapshot: LoadCatalogSnapshot,
  refs: CatalogReference[],
): Promise<CatalogDataItem[]> {
  const catalogData: CatalogDataItem[] = [];
  for (const ref of refs) {
    const catalog = await loadCatalogSnapshot.execute(ref.name, ref.version);
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

@singleton()
export class UpdateAllCatalogsController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly getCatalogRefs: GetCatalogRefs,
    private readonly loadCatalogSnapshot: LoadCatalogSnapshot,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEdit,
    private readonly saveTemplate: SaveTemplate,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    const catalogRefs = this.getCatalogRefs.execute();
    if (!template) return;
    const catalogVersionsByName = catalogVersionsByNameFromRefs(catalogRefs);
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const newCatalogRefs: CatalogReference[] = base.catalogRefs.map((ref) => {
      const versions = catalogVersionsByName[ref.name];
      const latest = versions?.[0];
      return latest ? { name: ref.name, version: latest.version } : ref;
    });
    const catalogData = await loadCatalogData(this.loadCatalogSnapshot, newCatalogRefs);
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
    await this.saveTemplate.execute(updated);
    await this.templateSharedFlows.refreshRefsAndSelect(updated.name, updated.version);
  }
}
