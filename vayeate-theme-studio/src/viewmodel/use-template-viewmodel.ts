import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useCatalogsState, useTemplatesState } from '../ui/context/slice-contexts';
import { compareVersions, nextPatchVersion } from '../utils/version';
import { createLogger } from '../utils/logger';
import { catalogService } from '../services/catalog-service';
import { formatSemanticSelector, parseSemanticSelector } from '../core/semantic-token';
import type {
  CatalogReference,
  ColorVariable,
  ColorVariableKey,
  ContrastVariable,
  ContrastVariableKey,
  Mapping,
  Template,
  TemplateReference,
  Token,
  TokenType,
} from '../model/schemas';

const log = createLogger('TemplateVM');

export function useTemplateViewModel() {
  const dispatch = useAppDispatch();
  const { templateRefs, selectedRef, template, isCreating, createDialogOpen } = useTemplatesState();
  const { catalogRefs } = useCatalogsState();

  useEffect(() => {
    log.debug('initial mount → LOAD_TEMPLATE_REFS + LOAD_CATALOG_REFS');
    dispatch({ type: 'LOAD_TEMPLATE_REFS' });
    dispatch({ type: 'LOAD_CATALOG_REFS' });
  }, [dispatch]);

  const templateNames = useMemo(() => {
    const names = new Set(templateRefs.map((r) => r.name));
    return [...names].sort();
  }, [templateRefs]);

  const selectedName = selectedRef?.name ?? null;

  const versionsForSelectedName = useMemo(() => {
    if (!selectedName) return [];
    return templateRefs
      .filter((r) => r.name === selectedName)
      .sort((a, b) => compareVersions(b.version, a.version));
  }, [templateRefs, selectedName]);

  const highestVersionForName = useCallback(
    (name: string): TemplateReference | null => {
      const refs = templateRefs.filter((r) => r.name === name);
      if (refs.length === 0) return null;
      return refs.reduce((best, r) =>
        compareVersions(r.version, best.version) > 0 ? r : best,
      );
    },
    [templateRefs],
  );

  const isLatestVersion = useMemo(() => {
    if (!selectedRef || !selectedName) return false;
    const best = templateRefs
      .filter((r) => r.name === selectedName)
      .reduce<TemplateReference | null>(
        (acc, r) => (!acc || compareVersions(r.version, acc.version) > 0 ? r : acc),
        null,
      );
    return best !== null && best.version === selectedRef.version;
  }, [templateRefs, selectedRef, selectedName]);

  // --- Catalog list helpers ---

  const catalogNamesList = useMemo(() => {
    const names = new Set(catalogRefs.map((r) => r.name));
    return [...names].sort();
  }, [catalogRefs]);

  const catalogVersionsByName = useMemo(() => {
    const map: Record<string, CatalogReference[]> = {};
    for (const ref of catalogRefs) {
      if (!map[ref.name]) map[ref.name] = [];
      map[ref.name].push(ref);
    }
    for (const name of Object.keys(map)) {
      map[name].sort((a, b) => compareVersions(b.version, a.version));
    }
    return map;
  }, [catalogRefs]);

  const includedCatalogMap = useMemo(() => {
    if (!template) return new Map<string, string>();
    const m = new Map<string, string>();
    for (const cr of template.catalogRefs) {
      m.set(cr.name, cr.version);
    }
    return m;
  }, [template]);

  const includedCatalogNamesWithUpdates = useMemo(() => {
    if (!template) return [];
    const names: string[] = [];
    for (const ref of template.catalogRefs) {
      const versions = catalogVersionsByName[ref.name];
      if (versions?.length > 0 && versions[0].version !== ref.version) {
        names.push(ref.name);
      }
    }
    return names;
  }, [template, catalogVersionsByName]);

  // --- Mapping helpers ---

  const mappingsByType = useMemo(() => {
    const groups: Record<TokenType, Mapping[]> = { theme: [], 'textmate token': [], 'semantic token': [] };
    if (!template) return groups;
    for (const m of template.mappings) {
      groups[m.token.type].push(m);
    }
    return groups;
  }, [template]);

  const mappingCountsByType = useMemo(() => {
    const counts: Record<TokenType, number> = { theme: 0, 'textmate token': 0, 'semantic token': 0 };
    if (!template) return counts;
    for (const m of template.mappings) {
      counts[m.token.type]++;
    }
    return counts;
  }, [template]);

  // --- Variable helpers ---

  const colorVariableKeys = useMemo(() => {
    if (!template) return new Set<string>();
    return new Set(template.colorVariables.map((v) => v.key));
  }, [template]);

  const contrastVariableKeys = useMemo(() => {
    if (!template) return new Set<string>();
    return new Set(template.contrastVariables.map((v) => v.key));
  }, [template]);

  const referencedColorVarKeys = useMemo(() => {
    if (!template) return new Set<string>();
    const s = new Set<string>();
    for (const m of template.mappings) {
      if (m.colorVariableRef) s.add(m.colorVariableRef);
    }
    for (const cv of template.contrastVariables) {
      if (cv.comparisonSourceRef) s.add(cv.comparisonSourceRef);
    }
    return s;
  }, [template]);

  const referencedContrastVarKeys = useMemo(() => {
    if (!template) return new Set<string>();
    const s = new Set<string>();
    for (const m of template.mappings) {
      if (m.contrastVariableRef) s.add(m.contrastVariableRef);
    }
    return s;
  }, [template]);

  // --- Group helpers ---

  const groups = useMemo(() => template?.groups ?? [], [template]);

  const groupNamesInUse = useMemo(() => {
    if (!template) return new Set<string>();
    const s = new Set<string>();
    for (const m of template.mappings) {
      if (m.groupRef) s.add(m.groupRef);
    }
    for (const v of template.colorVariables) {
      if (v.groupRef) s.add(v.groupRef);
    }
    for (const v of template.contrastVariables) {
      if (v.groupRef) s.add(v.groupRef);
    }
    return s;
  }, [template]);

  const canLock = useMemo(() => {
    if (!template || template.locked || !isLatestVersion) return false;
    return template.mappings.every((m) => m.colorVariableRef !== null);
  }, [template, isLatestVersion]);

  // --- Helpers for edit-when-locked ---

  function getBaseForEdit(t: Template): Template {
    if (t.locked) {
      return { ...t, version: nextPatchVersion(t.version), locked: false };
    }
    return t;
  }

  // --- Actions ---

  const selectTemplate = useCallback(
    (name: string, version: string) => {
      log.debug('selectTemplate', name, `v${version}`);
      dispatch({ type: 'SELECT_TEMPLATE', name, version });
    },
    [dispatch],
  );

  const selectName = useCallback(
    (name: string) => {
      const best = highestVersionForName(name);
      if (best) {
        log.debug('selectName', name, '→ highest version', `v${best.version}`);
        dispatch({ type: 'SELECT_TEMPLATE', name: best.name, version: best.version });
      } else {
        log.warn('selectName', name, '→ no versions found');
      }
    },
    [dispatch, highestVersionForName],
  );

  const openCreateDialog = useCallback(() => {
    log.debug('openCreateDialog');
    dispatch({ type: 'OPEN_TEMPLATE_CREATE_DIALOG' });
  }, [dispatch]);

  const closeCreateDialog = useCallback(() => {
    log.debug('closeCreateDialog');
    dispatch({ type: 'CLOSE_TEMPLATE_CREATE_DIALOG' });
  }, [dispatch]);

  const createTemplate = useCallback(
    (params: { name: string }) => {
      log.debug('createTemplate', params.name);
      dispatch({ type: 'CREATE_TEMPLATE', params });
    },
    [dispatch],
  );

  const deleteVersion = useCallback(
    (name: string, version: string) => {
      log.debug('deleteVersion', name, `v${version}`);
      dispatch({ type: 'DELETE_TEMPLATE_VERSION', name, version });
    },
    [dispatch],
  );

  const lockTemplate = useCallback(() => {
    if (!template || !canLock) {
      log.warn('lockTemplate skipped');
      return;
    }
    log.debug('lockTemplate', template.name, `v${template.version}`);
    const updated: Template = { ...template, locked: true };
    dispatch({ type: 'SAVE_TEMPLATE', template: updated });
  }, [dispatch, template, canLock]);

  // --- Catalog inclusion ---

  const toggleCatalog = useCallback(
    async (catalogName: string, include: boolean) => {
      if (!template) return;
      log.debug('toggleCatalog', catalogName, include ? 'include' : 'exclude');

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

      const { mappings: newMappings, groupsToEnsure } = await mergeMappingsFromCatalogRefs(
        newCatalogRefs,
        base.mappings,
      );

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

      const updated: Template = { ...base, catalogRefs: newCatalogRefs, mappings: newMappings, groups: newGroups };
      dispatch({ type: 'SAVE_TEMPLATE', template: updated });
    },
    [dispatch, template, catalogVersionsByName],
  );

  const changeCatalogVersion = useCallback(
    async (catalogName: string, newVersion: string) => {
      if (!template) return;
      log.debug('changeCatalogVersion', catalogName, `v${newVersion}`);

      const base = getBaseForEdit(template);
      const newCatalogRefs = base.catalogRefs.map((r) =>
        r.name === catalogName ? { ...r, version: newVersion } : r,
      );

      const { mappings: newMappings, groupsToEnsure } = await mergeMappingsFromCatalogRefs(
        newCatalogRefs,
        base.mappings,
      );
      const newGroups = [...(base.groups ?? [])];
      for (const g of groupsToEnsure) {
        if (!newGroups.includes(g)) newGroups.push(g);
      }
      const updated: Template = { ...base, catalogRefs: newCatalogRefs, mappings: newMappings, groups: newGroups };
      dispatch({ type: 'SAVE_TEMPLATE', template: updated });
    },
    [dispatch, template],
  );

  const updateAllCatalogsToLatest = useCallback(
    async () => {
      if (!template || !isLatestVersion) return;
      log.debug('updateAllCatalogsToLatest');

      const base = getBaseForEdit(template);
      const newCatalogRefs: CatalogReference[] = base.catalogRefs.map((ref) => {
        const versions = catalogVersionsByName[ref.name];
        const latest = versions?.[0];
        return latest ? { name: ref.name, version: latest.version } : ref;
      });

      const { mappings: newMappings, groupsToEnsure } = await mergeMappingsFromCatalogRefs(
        newCatalogRefs,
        base.mappings,
      );
      const newGroups = [...(base.groups ?? [])];
      for (const g of groupsToEnsure) {
        if (!newGroups.includes(g)) newGroups.push(g);
      }
      const updated: Template = { ...base, catalogRefs: newCatalogRefs, mappings: newMappings, groups: newGroups };
      dispatch({ type: 'SAVE_TEMPLATE', template: updated });
    },
    [dispatch, template, isLatestVersion, catalogVersionsByName],
  );

  // --- Mapping updates ---

  const updateMappingColorRef = useCallback(
    (
      tokenKey: string,
      tokenType: TokenType,
      colorRef: ColorVariableKey | null,
      isOrphan?: boolean,
    ) => {
      if (!template) return;
      log.debug('updateMappingColorRef', tokenKey, tokenType, colorRef, isOrphan);
      const base = getBaseForEdit(template);

      if (colorRef === null && isOrphan) {
        const newMappings = base.mappings.filter(
          (m) => !(m.token.key === tokenKey && m.token.type === tokenType),
        );
        dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, mappings: newMappings } });
        return;
      }

      const newMappings = base.mappings.map((m) =>
        m.token.key === tokenKey && m.token.type === tokenType
          ? { ...m, colorVariableRef: colorRef }
          : m,
      );
      dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, mappings: newMappings } });
    },
    [dispatch, template],
  );

  const updateMappingContrastRef = useCallback(
    (tokenKey: string, tokenType: TokenType, contrastRef: ContrastVariableKey | null) => {
      if (!template) return;
      log.debug('updateMappingContrastRef', tokenKey, tokenType, contrastRef);
      const base = getBaseForEdit(template);
      const newMappings = base.mappings.map((m) =>
        m.token.key === tokenKey && m.token.type === tokenType
          ? { ...m, contrastVariableRef: contrastRef }
          : m,
      );
      dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, mappings: newMappings } });
    },
    [dispatch, template],
  );

  const updateMappingGroupRef = useCallback(
    (tokenKey: string, tokenType: TokenType, groupRef: string | null) => {
      if (!template) return;
      log.debug('updateMappingGroupRef', tokenKey, tokenType, groupRef);
      const base = getBaseForEdit(template);
      const newMappings = base.mappings.map((m) =>
        m.token.key === tokenKey && m.token.type === tokenType
          ? { ...m, groupRef }
          : m,
      );
      dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, mappings: newMappings } });
    },
    [dispatch, template],
  );

  const addSemanticVariantMapping = useCallback(
    (type: string, modifiers: string[], language: string | null) => {
      if (!template) return;
      const key = formatSemanticSelector(type, modifiers, language);
      if (!key) return;
      const existing = template.mappings.some(
        (m) => m.token.type === 'semantic token' && m.token.key === key,
      );
      if (existing) return;
      log.debug('addSemanticVariantMapping', key);
      const base = getBaseForEdit(template);
      const newMapping: Mapping = {
        token: { key, type: 'semantic token' },
        colorVariableRef: null,
        contrastVariableRef: null,
        groupRef: null,
      };
      dispatch({
        type: 'SAVE_TEMPLATE',
        template: { ...base, mappings: [...base.mappings, newMapping] },
      });
    },
    [dispatch, template],
  );

  const removeMapping = useCallback(
    (tokenKey: string, tokenType: TokenType) => {
      if (!template) return;
      log.debug('removeMapping', tokenKey, tokenType);
      const base = getBaseForEdit(template);
      const newMappings = base.mappings.filter(
        (m) => !(m.token.key === tokenKey && m.token.type === tokenType),
      );
      dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, mappings: newMappings } });
    },
    [dispatch, template],
  );

  // --- Variable CRUD ---

  const addColorVariable = useCallback(
    (key: string, groupRef?: string | null) => {
      if (!template) return;
      log.debug('addColorVariable', key, groupRef ?? null);
      const base = getBaseForEdit(template);
      const newVars: ColorVariable[] = [
        ...base.colorVariables,
        { key, groupRef: groupRef ?? null },
      ];
      dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, colorVariables: newVars } });
    },
    [dispatch, template],
  );

  const removeColorVariable = useCallback(
    (key: string) => {
      if (!template) return;
      if (referencedColorVarKeys.has(key)) {
        log.warn('removeColorVariable blocked: variable is referenced', key);
        return;
      }
      log.debug('removeColorVariable', key);
      const base = getBaseForEdit(template);
      const newVars = base.colorVariables.filter((v) => v.key !== key);
      dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, colorVariables: newVars } });
    },
    [dispatch, template, referencedColorVarKeys],
  );

  const addContrastVariable = useCallback(
    (key: string, groupRef?: string | null) => {
      if (!template) return;
      log.debug('addContrastVariable', key, groupRef ?? null);
      const base = getBaseForEdit(template);
      const newVars: ContrastVariable[] = [
        ...base.contrastVariables,
        { key, comparisonSourceRef: null, groupRef: groupRef ?? null },
      ];
      dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, contrastVariables: newVars } });
    },
    [dispatch, template],
  );

  const removeContrastVariable = useCallback(
    (key: string) => {
      if (!template) return;
      if (referencedContrastVarKeys.has(key)) {
        log.warn('removeContrastVariable blocked: variable is referenced', key);
        return;
      }
      log.debug('removeContrastVariable', key);
      const base = getBaseForEdit(template);
      const newVars = base.contrastVariables.filter((v) => v.key !== key);
      dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, contrastVariables: newVars } });
    },
    [dispatch, template, referencedContrastVarKeys],
  );

  const updateContrastComparisonSource = useCallback(
    (key: string, comparisonSourceRef: ColorVariableKey | null) => {
      if (!template) return;
      log.debug('updateContrastComparisonSource', key, comparisonSourceRef);
      const base = getBaseForEdit(template);
      const newVars = base.contrastVariables.map((v) =>
        v.key === key ? { ...v, comparisonSourceRef } : v,
      );
      dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, contrastVariables: newVars } });
    },
    [dispatch, template],
  );

  const updateColorVariableGroupRef = useCallback(
    (key: string, groupRef: string | null) => {
      if (!template) return;
      log.debug('updateColorVariableGroupRef', key, groupRef);
      const base = getBaseForEdit(template);
      const newVars = base.colorVariables.map((v) =>
        v.key === key ? { ...v, groupRef } : v,
      );
      dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, colorVariables: newVars } });
    },
    [dispatch, template],
  );

  const updateContrastVariableGroupRef = useCallback(
    (key: string, groupRef: string | null) => {
      if (!template) return;
      log.debug('updateContrastVariableGroupRef', key, groupRef);
      const base = getBaseForEdit(template);
      const newVars = base.contrastVariables.map((v) =>
        v.key === key ? { ...v, groupRef } : v,
      );
      dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, contrastVariables: newVars } });
    },
    [dispatch, template],
  );

  // --- Group CRUD ---

  const addGroup = useCallback(
    (name: string) => {
      if (!template) return;
      const trimmed = name.trim();
      if (!trimmed) {
        log.warn('addGroup skipped: empty name');
        return;
      }
      const existing = template.groups ?? [];
      if (existing.includes(trimmed)) {
        log.warn('addGroup skipped: duplicate name', trimmed);
        return;
      }
      log.debug('addGroup', trimmed);
      const base = getBaseForEdit(template);
      const newGroups = [...(base.groups ?? []), trimmed];
      dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, groups: newGroups } });
    },
    [dispatch, template],
  );

  const removeGroup = useCallback(
    (name: string) => {
      if (!template) return;
      if (groupNamesInUse.has(name)) {
        log.warn('removeGroup blocked: group has mappings or variables', name);
        return;
      }
      log.debug('removeGroup', name);
      const base = getBaseForEdit(template);
      const newGroups = (base.groups ?? []).filter((g) => g !== name);
      dispatch({ type: 'SAVE_TEMPLATE', template: { ...base, groups: newGroups } });
    },
    [dispatch, template, groupNamesInUse],
  );

  return {
    templateRefs,
    selectedRef,
    template,
    isCreating,
    createDialogOpen,
    templateNames,
    selectedName,
    versionsForSelectedName,
    isLatestVersion,
    canLock,
    catalogNamesList,
    catalogVersionsByName,
    includedCatalogMap,
    includedCatalogNamesWithUpdates,
    mappingsByType,
    mappingCountsByType,
    colorVariableKeys,
    contrastVariableKeys,
    referencedColorVarKeys,
    referencedContrastVarKeys,
    groups,
    groupNamesInUse,
    selectTemplate,
    selectName,
    openCreateDialog,
    closeCreateDialog,
    createTemplate,
    deleteVersion,
    lockTemplate,
    toggleCatalog,
    changeCatalogVersion,
    updateAllCatalogsToLatest,
    updateMappingColorRef,
    updateMappingContrastRef,
    updateMappingGroupRef,
    addSemanticVariantMapping,
    removeMapping,
    updateColorVariableGroupRef,
    updateContrastVariableGroupRef,
    addGroup,
    removeGroup,
    addColorVariable,
    removeColorVariable,
    addContrastVariable,
    removeContrastVariable,
    updateContrastComparisonSource,
  };
}

export interface MergeMappingsResult {
  mappings: Mapping[];
  groupsToEnsure: string[];
}

async function mergeMappingsFromCatalogRefs(
  catalogRefs: readonly CatalogReference[],
  existingMappings: readonly Mapping[],
): Promise<MergeMappingsResult> {
  const catalogTokensByRef: { ref: CatalogReference; tokens: readonly Token[] }[] = [];
  const semanticTypesSet = new Set<string>(['*']);
  for (const ref of catalogRefs) {
    const catalog = await catalogService.loadCatalog(ref.name, ref.version);
    if (catalog) {
      catalogTokensByRef.push({ ref, tokens: catalog.tokens });
      const types = catalog.semanticTokenTypes ?? [];
      for (const t of types) semanticTypesSet.add(t);
    }
  }

  const allTokens = catalogTokensByRef.flatMap(({ tokens }) => tokens);
  const catalogTokenKeys = new Set(allTokens.map((t) => `${t.type}::${t.key}`));
  for (const type of semanticTypesSet) {
    catalogTokenKeys.add(`semantic token::${type}`);
  }

  const existingKeys = new Set(
    existingMappings.map((m) => `${m.token.type}::${m.token.key}`),
  );

  const newMappings: Mapping[] = [];
  const groupsToEnsure = new Set<string>();

  for (const m of existingMappings) {
    const key = `${m.token.type}::${m.token.key}`;
    const inCatalog = catalogTokenKeys.has(key);
    const hasColorAssignment = m.colorVariableRef !== null;
    if (inCatalog) {
      newMappings.push(m);
    } else if (hasColorAssignment) {
      newMappings.push(m);
    }
  }

  for (const { ref, tokens } of catalogTokensByRef) {
    for (const token of tokens) {
      if (token.type === 'semantic token') continue;
      const key = `${token.type}::${token.key}`;
      if (!existingKeys.has(key)) {
        newMappings.push({
          token,
          colorVariableRef: null,
          contrastVariableRef: null,
          groupRef: ref.name,
        });
        groupsToEnsure.add(ref.name);
        existingKeys.add(key);
      }
    }
  }

  for (const type of semanticTypesSet) {
    const key = `semantic token::${type}`;
    if (existingKeys.has(key)) continue;
    newMappings.push({
      token: { key: type, type: 'semantic token' },
      colorVariableRef: null,
      contrastVariableRef: null,
      groupRef: null,
    });
    existingKeys.add(key);
  }

  return { mappings: newMappings, groupsToEnsure: [...groupsToEnsure] };
}

export interface SemanticCatalogInfo {
  semanticTokenTypes: string[];
  semanticTokenModifiers: string[];
  semanticTokenLanguages: string[];
}

export function computeOrphanKeys(
  mappings: readonly Mapping[],
  catalogTokens: readonly Token[],
  semanticCatalog?: SemanticCatalogInfo,
): Set<string> {
  const catalogKeys = new Set(catalogTokens.map((t) => `${t.type}::${t.key}`));
  const typesSet = semanticCatalog
    ? new Set(semanticCatalog.semanticTokenTypes.concat('*'))
    : null;
  const modifiersSet = semanticCatalog
    ? new Set(semanticCatalog.semanticTokenModifiers)
    : null;
  const languagesSet = semanticCatalog
    ? new Set(semanticCatalog.semanticTokenLanguages)
    : null;

  const orphans = new Set<string>();
  for (const m of mappings) {
    const key = `${m.token.type}::${m.token.key}`;
    if (catalogKeys.has(key)) continue;
    if (m.token.type === 'semantic token' && typesSet && modifiersSet && languagesSet) {
      try {
        const parsed = parseSemanticSelector(m.token.key);
        const typeOk = parsed.type === '*' || typesSet.has(parsed.type);
        const modOk = parsed.modifiers.every((mod) => modifiersSet.has(mod));
        const langOk = !parsed.language || languagesSet.has(parsed.language);
        if (typeOk && modOk && langOk) continue;
      } catch {
        // invalid selector → orphan
      }
    }
    orphans.add(key);
  }
  return orphans;
}
