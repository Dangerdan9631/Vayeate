import type {
  CatalogReference,
  ColorVariable,
  ColorVariableKey,
  ContrastVariable,
  ContrastVariableKey,
  Mapping,
  Template,
  TokenType,
} from '../model/schemas';
import { formatSemanticSelector, parseSemanticSelector, SEMANTIC_WILDCARD_TYPE } from '../core/semantic-token';
import { compareVersions, nextPatchVersion } from '../utils/version';
import * as catalogController from './catalog-controller';
import {
  loadTemplateRefs as loadTemplateRefsOp,
  setSelectedTemplateRef,
  setTemplateCreateFormName,
  setTemplate,
  setTemplateMappingSearchText,
  setTemplateMappingColorVariableFilter,
  setTemplateMappingContrastVariableFilter,
  setTemplateMappingTokenGroupSelection,
  setTemplateVariablesSearchText,
  loadTemplate,
  refreshTemplateRefs,
  saveTemplate as saveTemplateOp,
  deleteTemplate as deleteTemplateOp,
  createTemplate as createTemplateOperation,
  type SetState,
} from '../operations/template-operations';
import { setCurrentUndoStackId, type GetState } from '../operations/undo-operations';
import { mergeMappingsFromCatalogRefs } from '../services/template-catalog-merge';

export interface CreateTemplateParams {
  name: string;
}

export function createTemplateWithParams(params: CreateTemplateParams): Template {
  return {
    name: params.name,
    version: '1.0.0',
    locked: false,
    catalogRefs: [],
    mappings: [],
    colorVariables: [],
    contrastVariables: [],
    groups: [],
    semanticTokenModifiers: [],
    semanticTokenLanguages: [],
  };
}

export function templateStackId(name: string, version: string): string {
  return `template:${name}:${version}`;
}

export async function loadTemplateRefs(setState: SetState): Promise<void> {
  await loadTemplateRefsOp(setState);
}

/** Load template refs and catalog refs for the template page. */
export async function loadTemplatePage(setState: SetState): Promise<void> {
  await loadTemplateRefsOp(setState);
  await catalogController.loadCatalogRefs(setState);
}

export async function selectTemplateAndLoad(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  const ref = { name, version };
  setSelectedTemplateRef(setState, ref);
  const template = await loadTemplate(setState, name, version);
  if (template?.catalogRefs?.length) {
    await catalogController.loadCatalogsForDisplay(
      setState,
      template.catalogRefs.map((r) => ({ name: r.name, version: r.version })),
    );
  }
  setCurrentUndoStackId(setState, templateStackId(name, version));
}

export function openTemplateCreateDialog(setState: SetState): void {
  setTemplateCreateFormName(setState, '');
  setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: true });
}

/** Open create dialog and reset form (V2: CREATE_BUTTON or CREATE_DIALOG_ON_OPEN). */
export function openCreateDialog(setState: SetState): void {
  openTemplateCreateDialog(setState);
}

export function setCreateFormName(setState: SetState, value: string): void {
  setTemplateCreateFormName(setState, value);
}

export function closeTemplateCreateDialog(setState: SetState): void {
  setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: false });
  setTemplateCreateFormName(setState, '');
}

/** Close create dialog and clear form (V2: CANCEL_BUTTON). */
export function closeCreateDialog(setState: SetState): void {
  closeTemplateCreateDialog(setState);
}

async function refreshRefsAndSelect(
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

export async function createTemplate(
  setState: SetState,
  params: { name: string },
): Promise<void> {
  setState({ type: 'SET_TEMPLATE_IS_CREATING', value: true });
  setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: false });
  try {
    const newTemplate = await createTemplateOperation(setState, params);
    await refreshTemplateRefs(setState);
    setTemplate(setState, newTemplate);
    setSelectedTemplateRef(setState, {
      name: newTemplate.name,
      version: newTemplate.version,
    });
    setCurrentUndoStackId(setState, templateStackId(newTemplate.name, newTemplate.version));
  } finally {
    setState({ type: 'SET_TEMPLATE_IS_CREATING', value: false });
  }
}

export async function saveTemplate(
  setState: SetState,
  template: Template,
): Promise<void> {
  await saveTemplateOp(template);
  await refreshRefsAndSelect(setState, template.name, template.version);
}

export async function deleteTemplateVersion(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  await deleteTemplateOp(name, version);
  const refs = await refreshTemplateRefs(setState);

  const sameName = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));
  const lowerT = sameName.filter((r) => compareVersions(r.version, version) < 0);
  const higherT = sameName.filter((r) => compareVersions(r.version, version) > 0);
  const nextT =
    lowerT.length > 0 ? lowerT[lowerT.length - 1] : higherT.length > 0 ? higherT[0] : null;

  if (nextT) {
    setSelectedTemplateRef(setState, nextT);
    await loadTemplate(setState, nextT.name, nextT.version);
    setCurrentUndoStackId(setState, templateStackId(nextT.name, nextT.version));
  } else {
    setSelectedTemplateRef(setState, null);
    setTemplate(setState, null);
    setCurrentUndoStackId(setState, null);
  }
}

export async function restoreTemplateState(
  setState: SetState,
  template: Template | null,
  deleteTemplateVersionOnRestore?: { name: string; version: string },
): Promise<void> {
  setTemplate(setState, template);
  if (template !== null) {
    setSelectedTemplateRef(setState, {
      name: template.name,
      version: template.version,
    });
    try {
      await saveTemplateOp(template);
    } catch {
      // persist failed
    }
    await refreshTemplateRefs(setState);
  }
  if (deleteTemplateVersionOnRestore) {
    await deleteTemplateOp(
      deleteTemplateVersionOnRestore.name,
      deleteTemplateVersionOnRestore.version,
    );
    await refreshTemplateRefs(setState);
  }
}

function getBaseForEdit(t: Template): Template {
  if (t.locked) {
    return { ...t, version: nextPatchVersion(t.version), locked: false };
  }
  return t;
}

/** Build catalog refs grouped by name, sorted by version descending (latest first). */
function catalogVersionsByNameFromRefs(catalogRefs: CatalogReference[]): Record<string, CatalogReference[]> {
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

export async function lockTemplate(setState: SetState, getState: GetState): Promise<void> {
  const template = getState().templates.template;
  if (!template || template.locked) return;
  await saveTemplateOp({ ...template, locked: true });
  await refreshRefsAndSelect(setState, template.name, template.version);
}

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
  const updated: Template = {
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
  let newCatalogRefs: CatalogReference[];
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
  const updated: Template = {
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
  const updated: Template = {
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

// --- Template UI state (mapping/variables filters and search) ---

export function setMappingSearchText(setState: SetState, value: string): void {
  setTemplateMappingSearchText(setState, value);
}

export function setMappingColorVariableFilter(
  setState: SetState,
  values: ColorVariableKey[],
): void {
  setTemplateMappingColorVariableFilter(setState, values);
}

export function setMappingContrastVariableFilter(
  setState: SetState,
  values: ContrastVariableKey[],
): void {
  setTemplateMappingContrastVariableFilter(setState, values);
}

export function setMappingTokenGroupSelection(setState: SetState, value: string): void {
  setTemplateMappingTokenGroupSelection(setState, value);
}

export function setVariablesSearchText(setState: SetState, value: string): void {
  setTemplateVariablesSearchText(setState, value);
}

// --- Template-mutating handlers (mappings, groups, variables) ---

function groupNamesInUseFromTemplate(t: Template): Set<string> {
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

function referencedColorVarKeysFromTemplate(t: Template): Set<string> {
  const s = new Set<string>();
  for (const m of t.mappings) {
    if (m.colorVariableRef) s.add(m.colorVariableRef);
  }
  for (const cv of t.contrastVariables) {
    if (cv.comparisonSourceRef) s.add(cv.comparisonSourceRef);
  }
  return s;
}

function referencedContrastVarKeysFromTemplate(t: Template): Set<string> {
  const s = new Set<string>();
  for (const m of t.mappings) {
    if (m.contrastVariableRef) s.add(m.contrastVariableRef);
  }
  return s;
}

export async function setMappingColorRef(
  setState: SetState,
  getState: GetState,
  tokenKey: string,
  tokenType: TokenType,
  colorRef: ColorVariableKey | null,
  isOrphan?: boolean,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  if (colorRef === null && isOrphan) {
    const newMappings = base.mappings.filter(
      (m) => !(m.token.key === tokenKey && m.token.type === tokenType),
    );
    await saveTemplateOp({ ...base, mappings: newMappings });
    await refreshRefsAndSelect(setState, base.name, base.version);
    return;
  }
  const newMappings = base.mappings.map((m) =>
    m.token.key === tokenKey && m.token.type === tokenType
      ? { ...m, colorVariableRef: colorRef }
      : m,
  );
  await saveTemplateOp({ ...base, mappings: newMappings });
  await refreshRefsAndSelect(setState, base.name, base.version);
}

export async function setMappingContrastRef(
  setState: SetState,
  getState: GetState,
  tokenKey: string,
  tokenType: TokenType,
  contrastRef: ContrastVariableKey | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const newMappings = base.mappings.map((m) =>
    m.token.key === tokenKey && m.token.type === tokenType
      ? { ...m, contrastVariableRef: contrastRef }
      : m,
  );
  await saveTemplateOp({ ...base, mappings: newMappings });
  await refreshRefsAndSelect(setState, base.name, base.version);
}

export async function setMappingGroupRef(
  setState: SetState,
  getState: GetState,
  tokenKey: string,
  tokenType: TokenType,
  groupRef: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  let semanticBaseType: string | null = null;
  if (tokenType === 'semantic token') {
    try {
      const parsed = parseSemanticSelector(tokenKey);
      const isBase =
        parsed.modifiers.length === 0 &&
        (parsed.language === null || parsed.language === '');
      if (isBase) semanticBaseType = parsed.type;
    } catch {
      /* not a valid semantic selector */
    }
  }
  const newMappings = base.mappings.map((m) => {
    if (m.token.type !== tokenType) return m;
    if (tokenType === 'semantic token' && semanticBaseType !== null) {
      try {
        const p = parseSemanticSelector(m.token.key);
        if (p.type === semanticBaseType) return { ...m, groupRef };
      } catch {
        /* ignore */
      }
      return m;
    }
    if (m.token.key === tokenKey) return { ...m, groupRef };
    return m;
  });
  await saveTemplateOp({ ...base, mappings: newMappings });
  await refreshRefsAndSelect(setState, base.name, base.version);
}

export async function addSemanticVariant(
  setState: SetState,
  getState: GetState,
  type: string,
  modifiers: string[],
  language: string | null,
  defaultGroupRef?: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const baseMapping = base.mappings.find(
    (m) => m.token.type === 'semantic token' && m.token.key === type,
  );
  let key: string;
  if (modifiers.length === 0 && (language === null || (language && language.trim() === ''))) {
    key = `${type}.empty-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  } else {
    key = formatSemanticSelector(type, modifiers, language);
    if (!key) return;
    const existing = template.mappings.some(
      (m) => m.token.type === 'semantic token' && m.token.key === key,
    );
    if (existing) return;
  }
  const groupRef =
    type === SEMANTIC_WILDCARD_TYPE && defaultGroupRef !== undefined
      ? defaultGroupRef
      : (baseMapping?.groupRef ?? null);
  const newMapping: Mapping = {
    token: { key, type: 'semantic token' },
    colorVariableRef: null,
    contrastVariableRef: null,
    groupRef,
  };
  const newModifiers = [...new Set([...(base.semanticTokenModifiers ?? []), ...modifiers])].sort();
  const newLanguages =
    language && language.trim() !== ''
      ? [...new Set([...(base.semanticTokenLanguages ?? []), language.trim()])].sort()
      : (base.semanticTokenLanguages ?? []);
  await saveTemplateOp({
    ...base,
    mappings: [...base.mappings, newMapping],
    semanticTokenModifiers: newModifiers,
    semanticTokenLanguages: newLanguages,
  });
  await refreshRefsAndSelect(setState, base.name, base.version);
}

export async function updateSemanticVariantKey(
  setState: SetState,
  getState: GetState,
  oldKey: string,
  modifiers: string[],
  language: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  let parsed: { type: string; modifiers: string[]; language: string | null };
  try {
    parsed = parseSemanticSelector(oldKey);
  } catch {
    return;
  }
  const newKey = formatSemanticSelector(parsed.type, modifiers, language);
  if (!newKey || newKey === oldKey) return;
  if (newKey === parsed.type) return;
  const existing = template.mappings.some(
    (m) => m.token.type === 'semantic token' && m.token.key === newKey,
  );
  if (existing) return;
  const base = getBaseForEdit(template);
  const newMappings = base.mappings.map((m) =>
    m.token.type === 'semantic token' && m.token.key === oldKey
      ? { ...m, token: { key: newKey, type: 'semantic token' as const } }
      : m,
  );
  const newModifiers = [...new Set([...(base.semanticTokenModifiers ?? []), ...modifiers])].sort();
  const newLanguages =
    language && language.trim() !== ''
      ? [...new Set([...(base.semanticTokenLanguages ?? []), language.trim()])].sort()
      : (base.semanticTokenLanguages ?? []);
  await saveTemplateOp({
    ...base,
    mappings: newMappings,
    semanticTokenModifiers: newModifiers,
    semanticTokenLanguages: newLanguages,
  });
  await refreshRefsAndSelect(setState, base.name, base.version);
}

export async function removeMapping(
  setState: SetState,
  getState: GetState,
  tokenKey: string,
  tokenType: TokenType,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const newMappings = base.mappings.filter(
    (m) => !(m.token.key === tokenKey && m.token.type === tokenType),
  );
  await saveTemplateOp({ ...base, mappings: newMappings });
  await refreshRefsAndSelect(setState, base.name, base.version);
}

export async function addGroup(
  setState: SetState,
  getState: GetState,
  name: string,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const trimmed = name.trim();
  if (!trimmed) return;
  const existing = template.groups ?? [];
  if (existing.includes(trimmed)) return;
  const base = getBaseForEdit(template);
  const newGroups = [...(base.groups ?? []), trimmed];
  await saveTemplateOp({ ...base, groups: newGroups });
  await refreshRefsAndSelect(setState, base.name, base.version);
}

export async function removeGroup(
  setState: SetState,
  getState: GetState,
  groupId: string,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const inUse = groupNamesInUseFromTemplate(template);
  if (inUse.has(groupId)) return;
  const base = getBaseForEdit(template);
  const newGroups = (base.groups ?? []).filter((g) => g !== groupId);
  await saveTemplateOp({ ...base, groups: newGroups });
  await refreshRefsAndSelect(setState, base.name, base.version);
}

export async function addColorVariable(
  setState: SetState,
  getState: GetState,
  key: string,
  groupRef?: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const newVars: ColorVariable[] = [
    ...base.colorVariables,
    { key, groupRef: groupRef ?? null },
  ];
  await saveTemplateOp({ ...base, colorVariables: newVars });
  await refreshRefsAndSelect(setState, base.name, base.version);
}

export async function addContrastVariable(
  setState: SetState,
  getState: GetState,
  key: string,
  groupRef?: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const newVars: ContrastVariable[] = [
    ...base.contrastVariables,
    { key, comparisonSourceRef: null, groupRef: groupRef ?? null },
  ];
  await saveTemplateOp({ ...base, contrastVariables: newVars });
  await refreshRefsAndSelect(setState, base.name, base.version);
}

export async function removeColorVariable(
  setState: SetState,
  getState: GetState,
  key: string,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const refs = referencedColorVarKeysFromTemplate(template);
  if (refs.has(key)) return;
  const base = getBaseForEdit(template);
  const newVars = base.colorVariables.filter((v) => v.key !== key);
  await saveTemplateOp({ ...base, colorVariables: newVars });
  await refreshRefsAndSelect(setState, base.name, base.version);
}

export async function removeContrastVariable(
  setState: SetState,
  getState: GetState,
  key: string,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const refs = referencedContrastVarKeysFromTemplate(template);
  if (refs.has(key)) return;
  const base = getBaseForEdit(template);
  const newVars = base.contrastVariables.filter((v) => v.key !== key);
  await saveTemplateOp({ ...base, contrastVariables: newVars });
  await refreshRefsAndSelect(setState, base.name, base.version);
}

export async function updateVariableGroupRef(
  setState: SetState,
  getState: GetState,
  variableKey: string,
  groupRef: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const colorIdx = base.colorVariables.findIndex((v) => v.key === variableKey);
  if (colorIdx >= 0) {
    const newVars = base.colorVariables.map((v) =>
      v.key === variableKey ? { ...v, groupRef } : v,
    );
    await saveTemplateOp({ ...base, colorVariables: newVars });
  } else {
    const newVars = base.contrastVariables.map((v) =>
      v.key === variableKey ? { ...v, groupRef } : v,
    );
    await saveTemplateOp({ ...base, contrastVariables: newVars });
  }
  await refreshRefsAndSelect(setState, base.name, base.version);
}

export async function updateContrastComparisonSource(
  setState: SetState,
  getState: GetState,
  contrastVariableKey: string,
  comparisonSourceRef: ColorVariableKey | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const newVars = base.contrastVariables.map((v) =>
    v.key === contrastVariableKey ? { ...v, comparisonSourceRef } : v,
  );
  await saveTemplateOp({ ...base, contrastVariables: newVars });
  await refreshRefsAndSelect(setState, base.name, base.version);
}
