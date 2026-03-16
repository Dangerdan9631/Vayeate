import type { SetStoreState } from '../../../state/store-state-reducer';
import { saveTemplate as saveTemplateOp, type SetState } from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { loadCatalogSnapshot } from '../../../operations/catalog-operations';
import {
  mergeMappingsFromCatalogData,
  type CatalogDataItem,
} from '../../../utils/template-catalog-merge';
import { getBaseForEdit, refreshRefsAndSelect } from '../shared-flows';

async function loadCatalogData(refs: readonly { name: string; version: string }[]): Promise<CatalogDataItem[]> {
  const catalogData: CatalogDataItem[] = [];
  for (const ref of refs) {
    const catalog = await loadCatalogSnapshot(ref.name, ref.version);
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

export async function changeCatalogVersion(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  catalogName: string,
  newVersion: string,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const newCatalogRefs = base.catalogRefs.map((r) =>
    r.name === catalogName ? { ...r, version: newVersion } : r,
  );
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


