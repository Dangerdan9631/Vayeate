import type { CatalogReference } from '../../../model/schemas';
import { getCatalogRefsFromStore } from '../../state/store-state';
import type { SetStoreState } from '../../state/store-state-reducer';
import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import { catalogService } from '../../../gateway/services/catalog-service';
import {
  mergeMappingsFromCatalogData,
  type CatalogDataItem,
} from '../../utils/template-catalog-merge';
import { catalogVersionsByNameFromRefs, getBaseForEdit, refreshRefsAndSelect } from './_helpers';

async function loadCatalogData(refs: CatalogReference[]): Promise<CatalogDataItem[]> {
  const catalogData: CatalogDataItem[] = [];
  for (const ref of refs) {
    const catalog = await catalogService.loadCatalog(ref.name, ref.version);
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

export async function updateAllCatalogs(setState: SetState, setStoreState: SetStoreState, getState: GetState): Promise<void> {
  const template = getState().templates.template;
  const catalogRefs = getCatalogRefsFromStore(getState().store);
  if (!template) return;
  const catalogVersionsByName = catalogVersionsByNameFromRefs(catalogRefs);
  const base = getBaseForEdit(template);
  const newCatalogRefs: CatalogReference[] = base.catalogRefs.map((ref) => {
    const versions = catalogVersionsByName[ref.name];
    const latest = versions?.[0];
    return latest ? { name: ref.name, version: latest.version } : ref;
  });
  const catalogData = await loadCatalogData(newCatalogRefs);
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
  await saveTemplateOp(updated);
  await refreshRefsAndSelect(setState, setStoreState, updated.name, updated.version);
}
