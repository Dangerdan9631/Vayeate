import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import { GetCatalogRefsOperation } from '../../../operations/catalog-operations/catalog-list/get-catalog-refs-operation';
import { LoadCatalogSnapshotOperation } from '../../../operations/catalog-operations/catalog-details/load-catalog-snapshot-operation';
import { BumpTemplateVersionForEditOperation } from '../../../operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { SaveTemplateOperation } from '../../../operations/template-operations/template-details/save-template-operation';
import {
  mergeMappingsFromCatalogData,
  type CatalogDataItem,
} from '../../../utils/template-catalog-merge';
import { catalogVersionsByNameFromRefs } from '../../../utils/catalog-versions-by-name-from-refs';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-and-select-operation';

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
export class ToggleCatalogController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly getCatalogRefs: GetCatalogRefsOperation,
    private readonly loadCatalogSnapshot: LoadCatalogSnapshotOperation,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(catalogName: string): Promise<void> {
    const template = this.templatesStateGetter.current().template;
    const catalogRefs = this.getCatalogRefs.execute();
    if (!template) return;
    const currentlyIncluded = template.catalogRefs.some((r) => r.name === catalogName);
    const include = !currentlyIncluded;
    const catalogVersionsByName = catalogVersionsByNameFromRefs(catalogRefs);
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
    const catalogData = await loadCatalogData(this.loadCatalogSnapshot, newCatalogRefs);
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
    await this.saveTemplate.execute(updated);
    await this.refreshTemplateRefsAndSelect.execute(updated.name, updated.version);
  }
}
