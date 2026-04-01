import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import { LoadCatalogSnapshotOperation } from '../../../operations/catalog-operations';
import {
  BumpTemplateVersionForEditOperation,
  SaveTemplateOperation,
} from '../../../operations/template-operations';
import {
  mergeMappingsFromCatalogData,
  type CatalogDataItem,
} from '../../../utils/template-catalog-merge';
import { TemplateSharedFlows } from '../shared-flows';

async function loadCatalogData(
  loadCatalogSnapshot: LoadCatalogSnapshotOperation,
  refs: readonly { name: string; version: string }[],
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
export class ChangeCatalogVersionController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly loadCatalogSnapshot: LoadCatalogSnapshotOperation,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(catalogName: string, newVersion: string): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const newCatalogRefs = base.catalogRefs.map((r) =>
      r.name === catalogName ? { ...r, version: newVersion } : r,
    );
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
