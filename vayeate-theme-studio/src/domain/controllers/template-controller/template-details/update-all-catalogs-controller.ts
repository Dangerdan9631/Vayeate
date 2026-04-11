import type { CatalogReference } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import { GetCatalogRefsOperation, LoadCatalogSnapshotOperation } from '../../../operations/catalog-operations';
import {
  BumpTemplateVersionForEditOperation,
  SaveTemplateOperation,
} from '../../../operations/template-operations';
import {
  mergeMappingsFromCatalogData,
  type CatalogDataItem,
} from '../../../utils/template-catalog-merge';
import { catalogVersionsByNameFromRefs } from '../../../utils/template-utils';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations';

async function loadCatalogData(
  loadCatalogSnapshot: LoadCatalogSnapshotOperation,
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
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly getCatalogRefs: GetCatalogRefsOperation,
    private readonly loadCatalogSnapshot: LoadCatalogSnapshotOperation,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(): Promise<void> {
    const template = this.templatesStateGetter.current().template;
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
    await this.refreshTemplateRefsAndSelect.execute(updated.name, updated.version);
  }
}
