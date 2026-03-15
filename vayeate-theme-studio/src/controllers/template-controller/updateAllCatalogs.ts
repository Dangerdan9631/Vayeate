import type { CatalogReference } from '../../model/schemas';
import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import { mergeMappingsFromCatalogRefs } from '../../services/template-catalog-merge';
import { catalogVersionsByNameFromRefs, getBaseForEdit, refreshRefsAndSelect } from './_helpers';

export async function updateAllCatalogs(setState: SetState, getState: GetState): Promise<void> {
  const template = getState().templates.template;
  const catalogRefs = getState().catalogs.catalogRefs;
  if (!template) return;
  const catalogVersionsByName = catalogVersionsByNameFromRefs(catalogRefs);
  const base = getBaseForEdit(template);
  const newCatalogRefs: CatalogReference[] = base.catalogRefs.map((ref) => {
    const versions = catalogVersionsByName[ref.name];
    const latest = versions?.[0];
    return latest ? { name: ref.name, version: latest.version } : ref;
  });
  const { mappings: newMappings, groupsToEnsure, semanticTokenModifiers, semanticTokenLanguages } =
    await mergeMappingsFromCatalogRefs(newCatalogRefs, base.mappings);
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
  await refreshRefsAndSelect(setState, updated.name, updated.version);
}
