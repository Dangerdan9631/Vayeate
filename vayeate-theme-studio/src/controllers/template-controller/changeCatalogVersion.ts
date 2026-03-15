import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import { mergeMappingsFromCatalogRefs } from '../../services/template-catalog-merge';
import { getBaseForEdit, refreshRefsAndSelect } from './_helpers';

export async function changeCatalogVersion(
  setState: SetState,
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
