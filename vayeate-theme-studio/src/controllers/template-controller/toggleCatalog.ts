import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import { mergeMappingsFromCatalogRefs } from '../../services/template-catalog-merge';
import {
  catalogVersionsByNameFromRefs,
  getBaseForEdit,
  refreshRefsAndSelect,
} from './_helpers';

export async function toggleCatalog(
  setState: SetState,
  getState: GetState,
  catalogName: string,
  include: boolean,
): Promise<void> {
  const template = getState().templates.template;
  const catalogRefs = getState().catalogs.catalogRefs;
  if (!template) return;
  const catalogVersionsByName = catalogVersionsByNameFromRefs(catalogRefs);
  const base = getBaseForEdit(template);
  let newCatalogRefs: { name: string; version: string }[];
  if (include) {
    const versions = catalogVersionsByName[catalogName];
    if (!versions || versions.length === 0) return;
    const highestVersion = versions[0].version;
    newCatalogRefs = [...base.catalogRefs, { name: catalogName, version: highestVersion }];
  } else {
    newCatalogRefs = base.catalogRefs.filter((r) => r.name !== catalogName);
  }
  const { mappings: newMappings, groupsToEnsure, semanticTokenModifiers, semanticTokenLanguages } =
    await mergeMappingsFromCatalogRefs(newCatalogRefs, base.mappings);
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
  await saveTemplateOp(updated);
  await refreshRefsAndSelect(setState, updated.name, updated.version);
}
