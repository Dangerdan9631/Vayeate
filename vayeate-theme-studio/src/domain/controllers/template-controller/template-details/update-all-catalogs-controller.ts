import type { CatalogReference } from '../../../../model/schemas';
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
    const catalogData: CatalogDataItem[] = [];
    for (const ref of newCatalogRefs) {
      const catalog = await this.loadCatalogSnapshot.execute(ref.name, ref.version);
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
    await this.saveTemplate.execute(updated);
    await this.refreshTemplateRefsAndSelect.execute(updated.name, updated.version);
  }
}
