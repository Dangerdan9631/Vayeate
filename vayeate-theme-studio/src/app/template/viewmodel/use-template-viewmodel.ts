import { useCallback, useEffect, useMemo } from 'react';
import { useCatalogsState } from '../../catalog/context/use-catalogs-state';
import { useAppDispatch } from '../../core/context/use-app-dispatch';
import { useTemplatesState } from '../context/use-templates-state';
import { getCatalogRefsFromCatalogMap } from '../../../domain/state/catalog/catalogs-state';
import { getTemplateRefs } from '../../../domain/state/template/templates-state';
import { compareVersions } from '../../../domain/utils/version';
import { parseSemanticSelector, SEMANTIC_WILDCARD_TYPE } from '../../../domain/utils/semantic-token';
import { TemplateActionType } from '../actions/template-action-type';
import type {
  CatalogReference,
  ColorVariableKey,
  ContrastVariableKey,
  Mapping,
  TemplateReference,
  Token,
  TokenType,
} from '../../../model/schemas';

let templatePageLoadDispatched = false;

export function useTemplateViewModel() {
  const dispatch = useAppDispatch();
  const templates = useTemplatesState();
  const {
    selectedRef,
    template,
    isCreating,
    createDialogOpen,
    createFormName,
    mappingSearchText,
    mappingColorVariableFilter,
    mappingContrastVariableFilter,
    mappingTokenGroupSelection,
    variablesSearchText,
  } = templates;
  const catalogs = useCatalogsState();
  const catalogRefs = useMemo(() => getCatalogRefsFromCatalogMap(catalogs.catalogMap), [catalogs.catalogMap]);
  const templateRefs = useMemo(() => getTemplateRefs(templates.templateMap), [templates.templateMap]);
  const { loadedForDisplay } = catalogs;

  useEffect(() => {
    if (templatePageLoadDispatched) return;
    templatePageLoadDispatched = true;
    dispatch({ type: TemplateActionType.TemplatePageOnLoad });
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

  /** Catalogs loaded for display (e.g. template page orphan keys); key = `${name}@${version}` */
  const loadedCatalogsForTemplateRefs = useMemo(() => {
    if (!template || template.catalogRefs.length === 0) return [];
    return template.catalogRefs.map((ref) => {
      const key = `${ref.name}@${ref.version}`;
      return loadedForDisplay[key] ?? null;
    });
  }, [template, loadedForDisplay]);

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

  // --- Actions ---

  const selectTemplate = useCallback(
    (name: string, version: string) => {
      dispatch({ type: TemplateActionType.TemplateTemplatesListOnCommit, name, version });
    },
    [dispatch],
  );

  const selectName = useCallback(
    (name: string) => {
      const best = highestVersionForName(name);
      if (best) {
        dispatch({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: best.name, version: best.version });
      }
    },
    [dispatch, highestVersionForName],
  );

  const openCreateDialog = useCallback(() => {
    dispatch({ type: TemplateActionType.TemplateTemplatesCreateButtonOnClick });
    dispatch({ type: TemplateActionType.TemplateCreateDialogOnOpen });
  }, [dispatch]);

  const closeCreateDialog = useCallback(() => {
    dispatch({ type: TemplateActionType.TemplateCreateDialogCancelButtonOnClick });
  }, [dispatch]);

  const createTemplate = useCallback(
    (params: { name: string }) => {
      dispatch({ type: TemplateActionType.TemplateCreateDialogOkButtonOnClick, params });
    },
    [dispatch],
  );

  const deleteVersion = useCallback(
    (name: string, version: string) => {
      dispatch({ type: TemplateActionType.TemplateDetailsDeleteVersionButtonOnClick, name, version });
    },
    [dispatch],
  );

  const lockTemplate = useCallback(() => {
    if (!template || !canLock) return;
    dispatch({ type: TemplateActionType.TemplateDetailsLockButtonOnClick });
  }, [template, canLock, dispatch]);

  const setCreateFormName = useCallback(
    (value: string) => {
      dispatch({ type: TemplateActionType.TemplateCreateDialogNameTextOnChange, value });
    },
    [dispatch],
  );

  // --- Catalog inclusion (dispatch only; controller performs the mutation) ---

  const toggleCatalog = useCallback(
    (catalogName: string, include: boolean) => {
      if (!template) return;
      dispatch({
        type: TemplateActionType.TemplateDetailsCatalogCheckboxOnToggle,
        catalogName: catalogName as import('../../../model/schemas').CatalogName,
        checked: include,
      });
    },
    [template, dispatch],
  );

  const changeCatalogVersion = useCallback(
    (catalogName: string, newVersion: string) => {
      if (!template) return;
      dispatch({
        type: TemplateActionType.TemplateDetailsCatalogVersionListOnCommit,
        catalogName: catalogName as import('../../../model/schemas').CatalogName,
        value: newVersion,
      });
    },
    [template, dispatch],
  );

  const updateAllCatalogsToLatest = useCallback(() => {
    if (!template || !isLatestVersion) return;
    dispatch({ type: TemplateActionType.TemplateDetailsUpdateAllButtonOnClick });
  }, [template, isLatestVersion, dispatch]);

  // --- Mapping updates (dispatch-only; processor invokes controller) ---

  const updateMappingColorRef = useCallback(
    (
      tokenKey: string,
      tokenType: TokenType,
      colorRef: ColorVariableKey | null,
      isOrphan?: boolean,
    ) => {
      dispatch({
        type: TemplateActionType.TemplateMappingExistingTokenColorVariableListOnCommit,
        value: colorRef as ColorVariableKey,
        tokenKey,
        tokenType,
        isOrphan,
      });
    },
    [dispatch],
  );

  const updateMappingContrastRef = useCallback(
    (tokenKey: string, tokenType: TokenType, contrastRef: ContrastVariableKey | null) => {
      dispatch({
        type: TemplateActionType.TemplateMappingExistingTokenContrastVariableListOnCommit,
        value: contrastRef,
        tokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const updateMappingGroupRef = useCallback(
    (tokenKey: string, tokenType: TokenType, groupRef: string | null) => {
      dispatch({
        type: TemplateActionType.TemplateMappingExistingTokenGroupListOnCommit,
        value: groupRef ?? '',
        tokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const addSemanticVariantMapping = useCallback(
    (semanticType: string, modifiers: string[], language: string | null, defaultGroupRef?: string | null) => {
      dispatch({
        type: TemplateActionType.TemplateMappingSemanticTokenAddVariantButtonOnClick,
        semanticType,
        modifiers,
        language,
        defaultGroupRef,
      });
    },
    [dispatch],
  );

  const updateSemanticVariantKey = useCallback(
    (oldKey: string, modifiers: string[], language: string | null) => {
      dispatch({
        type: TemplateActionType.TemplateMappingSemanticTokenModifierListOnCommit,
        tokenKey: oldKey,
        modifiers,
        language,
      });
    },
    [dispatch],
  );

  const removeMapping = useCallback(
    (tokenKey: string, tokenType: TokenType) => {
      dispatch({
        type: TemplateActionType.TemplateMappingSemanticTokenVariantRemoveButtonOnClick,
        tokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  // --- Variable CRUD (dispatch-only) ---

  const addColorVariable = useCallback(
    (key: string, groupRef?: string | null) => {
      dispatch({
        type: TemplateActionType.TemplateVariablesAddVariableButtonOnClick,
        key,
        groupRef: groupRef ?? null,
        variableKind: 'color',
      });
    },
    [dispatch],
  );

  const removeColorVariable = useCallback(
    (key: string) => {
      dispatch({ type: TemplateActionType.TemplateVariablesRemoveButtonOnClick, key });
    },
    [dispatch],
  );

  const addContrastVariable = useCallback(
    (key: string, groupRef?: string | null) => {
      dispatch({
        type: TemplateActionType.TemplateVariablesAddVariableButtonOnClick,
        key,
        groupRef: groupRef ?? null,
        variableKind: 'contrast',
      });
    },
    [dispatch],
  );

  const removeContrastVariable = useCallback(
    (key: string) => {
      dispatch({ type: TemplateActionType.TemplateVariablesRemoveButtonOnClick, key });
    },
    [dispatch],
  );

  const updateContrastComparisonSource = useCallback(
    (key: string, comparisonSourceRef: ColorVariableKey | null) => {
      dispatch({
        type: TemplateActionType.TemplateVariablesContrastSourceListOnCommit,
        value: comparisonSourceRef,
        contrastVariableKey: key as ContrastVariableKey,
      });
    },
    [dispatch],
  );

  const updateColorVariableGroupRef = useCallback(
    (key: string, groupRef: string | null) => {
      dispatch({
        type: TemplateActionType.TemplateVariablesGroupListOnCommit,
        value: groupRef ?? '',
        variableKey: key,
      });
    },
    [dispatch],
  );

  const updateContrastVariableGroupRef = useCallback(
    (key: string, groupRef: string | null) => {
      dispatch({
        type: TemplateActionType.TemplateVariablesGroupListOnCommit,
        value: groupRef ?? '',
        variableKey: key,
      });
    },
    [dispatch],
  );

  // --- Group CRUD (dispatch-only) ---

  const addGroup = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (trimmed) {
        dispatch({ type: TemplateActionType.TemplateGroupAddButtonOnClick, name: trimmed });
      }
    },
    [dispatch],
  );

  const removeGroup = useCallback(
    (name: string) => {
      dispatch({ type: TemplateActionType.TemplateGroupRemoveButtonOnClick, groupId: name });
    },
    [dispatch],
  );

  return {
    templateRefs,
    selectedRef,
    template,
    isCreating,
    createDialogOpen,
    createFormName,
    setCreateFormName,
    mappingSearchText,
    mappingColorVariableFilter,
    mappingContrastVariableFilter,
    mappingTokenGroupSelection,
    variablesSearchText,
    templateNames,
    selectedName,
    versionsForSelectedName,
    isLatestVersion,
    canLock,
    catalogNamesList,
    catalogVersionsByName,
    includedCatalogMap,
    includedCatalogNamesWithUpdates,
    loadedCatalogsForTemplateRefs,
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
    updateSemanticVariantKey,
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

export type { MergeMappingsResult } from '../../../model/schemas';

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
    ? new Set(semanticCatalog.semanticTokenTypes)
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
        const typeOk =
          parsed.type === SEMANTIC_WILDCARD_TYPE || typesSet.has(parsed.type);
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
