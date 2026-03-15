import type { CatalogReference, Template } from '../../model/schemas';
import { compareVersions, nextPatchVersion } from '../../utils/version';
import {
  setSelectedTemplateRef,
  loadTemplate,
  refreshTemplateRefs,
  type SetState,
} from '../../operations/template-operations';

export async function refreshRefsAndSelect(
  setState: SetState,
  selectName?: string,
  selectVersion?: string,
): Promise<void> {
  const refs = await refreshTemplateRefs(setState);
  if (selectName && selectVersion) {
    const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
    if (match) {
      setSelectedTemplateRef(setState, match);
      await loadTemplate(setState, match.name, match.version);
    }
  }
}

export function getBaseForEdit(t: Template): Template {
  if (t.locked) {
    return { ...t, version: nextPatchVersion(t.version), locked: false };
  }
  return t;
}

/** Build catalog refs grouped by name, sorted by version descending (latest first). */
export function catalogVersionsByNameFromRefs(
  catalogRefs: CatalogReference[],
): Record<string, CatalogReference[]> {
  const map: Record<string, CatalogReference[]> = {};
  for (const ref of catalogRefs) {
    if (!map[ref.name]) map[ref.name] = [];
    map[ref.name].push(ref);
  }
  for (const name of Object.keys(map)) {
    map[name].sort((a, b) => compareVersions(b.version, a.version));
  }
  return map;
}

export function groupNamesInUseFromTemplate(t: Template): Set<string> {
  const s = new Set<string>();
  for (const m of t.mappings) {
    if (m.groupRef) s.add(m.groupRef);
  }
  for (const v of t.colorVariables) {
    if (v.groupRef) s.add(v.groupRef);
  }
  for (const v of t.contrastVariables) {
    if (v.groupRef) s.add(v.groupRef);
  }
  return s;
}

export function referencedColorVarKeysFromTemplate(t: Template): Set<string> {
  const s = new Set<string>();
  for (const m of t.mappings) {
    if (m.colorVariableRef) s.add(m.colorVariableRef);
  }
  for (const cv of t.contrastVariables) {
    if (cv.comparisonSourceRef) s.add(cv.comparisonSourceRef);
  }
  return s;
}

export function referencedContrastVarKeysFromTemplate(t: Template): Set<string> {
  const s = new Set<string>();
  for (const m of t.mappings) {
    if (m.contrastVariableRef) s.add(m.contrastVariableRef);
  }
  return s;
}
