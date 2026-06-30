import { useCallback, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { compareVersions } from '../../../domain/utils/compare-versions';
import type { Catalog, Token } from '../../../model/schema/catalog';
import type { ColorVariableKey, ContrastVariableKey, StyleVariableKey, TokenType } from '../../../model/schema/primitives';
import type { CatalogReference, ColorVariable, ContrastVariable, Mapping, StyleVariable } from '../../../model/schema/template-schemas';
import { MappingsCardActionType } from './actions/mappings-card-action-type';
import { computeOrphanKeys, type SemanticCatalogInfo } from '../../../domain/utils/compute-orphan-keys';
import { CatalogsStore } from '../../../domain/catalog/state/catalogs-store';
import { getCurrentTemplate, TemplatesStore } from '../../../domain/state/data/templates-store';
import { TemplateUiStore } from '../../../domain/state/ui/template-ui-store';
import { container } from 'tsyringe';
import type { TemplateMappingAssignment, TemplateMappingId } from '../../../model/template-mapping-assignment';
import { templateMappingIdKey } from '../../../model/template-mapping-assignment';
import type { TriState } from '../../common/tristate-checkbox/TriStateCheckbox';

const catalogsStore = container.resolve(CatalogsStore);
const templatesStore = container.resolve(TemplatesStore);
const templateUiStore = container.resolve(TemplateUiStore);

const EMPTY_GROUPS: readonly string[] = [];
const EMPTY_COLOR_VARIABLES: readonly ColorVariable[] = [];
const EMPTY_CONTRAST_VARIABLES: readonly ContrastVariable[] = [];
const EMPTY_STYLE_VARIABLES: readonly StyleVariable[] = [];
const EMPTY_STRINGS: readonly string[] = [];
const EMPTY_CATALOG_REFS: readonly CatalogReference[] = [];
const EMPTY_VERSION_KEYS: readonly string[] = [];
const UNGROUPED_KEY = '__ungrouped__';
const DISPLAYED_TOKEN_TYPES: TokenType[] = ['theme', 'textmate token', 'semantic token'];

function matchesSearch(key: string, searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  return !q || key.toLowerCase().includes(q);
}

function filterMappings(
  mappings: Mapping[],
  searchQuery: string,
  selectedColorKeys: readonly string[],
  selectedContrastKeys: readonly string[],
  selectedStyleKeys: readonly string[],
): Mapping[] {
  return mappings.filter((m) => {
    if (!matchesSearch(m.token.key, searchQuery)) return false;
    if (selectedColorKeys.length > 0) {
      if (!m.colorVariableRef || !selectedColorKeys.includes(m.colorVariableRef)) return false;
    }
    if (selectedContrastKeys.length > 0) {
      if (!m.contrastVariableRef || !selectedContrastKeys.includes(m.contrastVariableRef))
        return false;
    }
    if (selectedStyleKeys.length > 0) {
      if (!m.styleVariableRef || !selectedStyleKeys.includes(m.styleVariableRef)) return false;
    }
    return true;
  });
}

function mappingIdFromMapping(mapping: Mapping): TemplateMappingId {
  return {
    tokenKey: mapping.token.key,
    tokenType: mapping.token.type,
  };
}

function buildByGroup(
  filteredMappingsByType: Record<TokenType, Mapping[]>,
): Map<string, Record<TokenType, Mapping[]>> {
  const byGroup = new Map<string, Record<TokenType, Mapping[]>>();

  function ensureGroup(key: string): Record<TokenType, Mapping[]> {
    let rec = byGroup.get(key);
    if (!rec) {
      rec = { theme: [], 'textmate token': [], 'semantic token': [] };
      byGroup.set(key, rec);
    }
    return rec;
  }

  for (const tt of DISPLAYED_TOKEN_TYPES) {
    for (const m of filteredMappingsByType[tt]) {
      const groupKey = m.groupRef ?? UNGROUPED_KEY;
      const rec = ensureGroup(groupKey);
      rec[tt].push(m);
    }
  }

  return byGroup;
}

function sortedGroupKeys(byGroup: Map<string, Record<TokenType, Mapping[]>>): string[] {
  const named = [...byGroup.keys()].filter((k) => k !== UNGROUPED_KEY).sort();
  const hasUngrouped = byGroup.has(UNGROUPED_KEY);
  return hasUngrouped ? [...named, UNGROUPED_KEY] : named;
}

function getUniformValue<T>(
  mappings: readonly Mapping[],
  selector: (mapping: Mapping) => T,
): T | undefined {
  if (mappings.length === 0) return undefined;
  const first = selector(mappings[0]);
  return mappings.every((mapping) => Object.is(selector(mapping), first)) ? first : undefined;
}

/**
 * Subscribes to template mappings, catalogs, and filter state for the mappings card.
 * @returns Mappings card state and dispatch-backed handlers.
 */
export function useMappingsCardViewModel() {
  const orphanKeysStashRef = useRef<Set<string>>(new Set());
  const dispatch = useAppDispatch();
  const selectedRef = useStore(templateUiStore.api, (state) => state.state.selectedRef);
  const selectedName = selectedRef?.name ?? null;
  const selectedVersion = selectedRef?.version ?? null;
  const template = useStore(
    templatesStore.api,
    (state) => getCurrentTemplate(state.state.templates, selectedRef),
  );
  const templateCatalogRefs = useMemo(
    () => template?.catalogRefs ?? EMPTY_CATALOG_REFS,
    [template?.catalogRefs],
  );
  const referencedCatalogSlots = useStore(
    catalogsStore.api,
    useShallow((state) =>
      templateCatalogRefs.map((ref: CatalogReference) =>
        state.state.catalogs[ref.name]?.[ref.version] ?? null,
      ),
    ),
  );
  const versionKeysForSelectedName = useStore(
    templatesStore.api,
    useShallow((state) => {
      if (!selectedName) return EMPTY_VERSION_KEYS;
      return Object.keys(state.state.templates[selectedName] ?? {}).sort();
    }),
  );
  const mappingSearchText = useStore(templateUiStore.api, (state) => state.state.mappingSearchText);
  const mappingColorVariableFilter = useStore(
    templateUiStore.api,
    useShallow((state) => state.state.mappingColorVariableFilter),
  );
  const mappingContrastVariableFilter = useStore(
    templateUiStore.api,
    useShallow((state) => state.state.mappingContrastVariableFilter),
  );
  const mappingStyleVariableFilter = useStore(
    templateUiStore.api,
    useShallow((state) => state.state.mappingStyleVariableFilter),
  );
  const selectedMappingIds = useStore(
    templateUiStore.api,
    useShallow((state) => state.state.selectedMappingIds),
  );
  const selectedMappingKeys = useMemo(
    () => new Set<string>(selectedMappingIds.map((id: TemplateMappingId) => templateMappingIdKey(id))),
    [selectedMappingIds],
  );

  const loadedCatalogsForTemplateRefs = useMemo(() => {
    if (referencedCatalogSlots.length === 0) return [];
    return referencedCatalogSlots.map((entry) => {
      if (!entry || !entry.isLoaded) return null;
      return entry.catalog;
    });
  }, [referencedCatalogSlots]);

  const orphanKeys = useMemo(() => {
    if (!template || loadedCatalogsForTemplateRefs.length === 0) {
      const empty = new Set<string>();
      orphanKeysStashRef.current = empty;
      return empty;
    }
    const loaded = loadedCatalogsForTemplateRefs;
    const allLoaded = loaded.every((c: Catalog | null) => c !== null);
    if (!allLoaded) {
      return orphanKeysStashRef.current;
    }
    const allTokens: Token[] = [];
    const typesSet = new Set<string>();
    const modifiersSet = new Set<string>();
    const languagesSet = new Set<string>();
    for (const catalog of loaded) {
      if (catalog) {
        allTokens.push(...catalog.tokens);
        (catalog.semanticTokenTypes ?? []).forEach((t: string) => typesSet.add(t));
        (catalog.semanticTokenModifiers ?? []).forEach((m: string) => modifiersSet.add(m));
        (catalog.semanticTokenLanguages ?? []).forEach((l: string) => languagesSet.add(l));
      }
    }
    const semanticCatalog: SemanticCatalogInfo | undefined =
      typesSet.size > 0 || modifiersSet.size > 0 || languagesSet.size > 0
        ? {
            semanticTokenTypes: [...typesSet].sort(),
            semanticTokenModifiers: [...modifiersSet].sort(),
            semanticTokenLanguages: [...languagesSet].sort(),
          }
        : undefined;
    const computed = computeOrphanKeys(template.mappings, allTokens, semanticCatalog);
    orphanKeysStashRef.current = computed;
    return computed;
  }, [template, loadedCatalogsForTemplateRefs]);

  const isLatestVersion = useMemo(() => {
    if (!selectedRef || !selectedName || !selectedVersion) return false;
    const bestVersion = versionKeysForSelectedName.reduce(
      (acc, version) => (!acc || compareVersions(version, acc) > 0 ? version : acc),
      null as string | null,
    );
    return bestVersion !== null && bestVersion === selectedVersion;
  }, [versionKeysForSelectedName, selectedRef, selectedName, selectedVersion]);

  const canEdit = template !== null && isLatestVersion;

  const mappingsByType = useMemo(() => {
    const groups: Record<TokenType, Mapping[]> = { theme: [], 'textmate token': [], 'semantic token': [] };
    if (!template) return groups;
    for (const m of template.mappings) {
      groups[m.token.type].push(m);
    }
    return groups;
  }, [template]);

  const updateMappingColorRef = useCallback(
    (tokenKey: string, tokenType: TokenType, colorRef: ColorVariableKey | null) => {
      void dispatch({
        type: MappingsCardActionType.MappingExistingTokenColorVariableListOnCommit,
        value: colorRef as ColorVariableKey,
        tokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const updateMappingContrastRef = useCallback(
    (tokenKey: string, tokenType: TokenType, contrastRef: ContrastVariableKey | null) => {
      void dispatch({
        type: MappingsCardActionType.MappingExistingTokenContrastVariableListOnCommit,
        value: contrastRef,
        tokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const updateMappingStyleRef = useCallback(
    (tokenKey: string, tokenType: TokenType, styleRef: StyleVariableKey | null) => {
      void dispatch({
        type: MappingsCardActionType.MappingExistingTokenStyleVariableListOnCommit,
        value: styleRef,
        tokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const updateMappingIgnored = useCallback(
    (tokenKey: string, tokenType: TokenType, ignored: boolean) => {
      void dispatch({
        type: MappingsCardActionType.MappingExistingTokenIgnoredCheckboxOnToggle,
        value: ignored,
        tokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const updateMappingGroupRef = useCallback(
    (tokenKey: string, tokenType: TokenType, groupRef: string | null) => {
      void dispatch({
        type: MappingsCardActionType.MappingExistingTokenGroupListOnCommit,
        value: groupRef ?? '',
        tokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const addSemanticVariantMapping = useCallback(
    (semanticType: string, defaultGroupRef?: string | null) => {
      void dispatch({
        type: MappingsCardActionType.MappingSemanticTokenAddVariantButtonOnClick,
        semanticType,
        defaultGroupRef,
      });
    },
    [dispatch],
  );

  const commitSemanticTokenModifiers = useCallback(
    (oldKey: string, modifiers: string[]) => {
      void dispatch({
        type: MappingsCardActionType.MappingSemanticTokenModifierListOnCommit,
        tokenKey: oldKey,
        modifiers,
      });
    },
    [dispatch],
  );

  const commitSemanticTokenLanguage = useCallback(
    (oldKey: string, language: string | null) => {
      void dispatch({
        type: MappingsCardActionType.MappingSemanticTokenLanguageListOnCommit,
        tokenKey: oldKey,
        value: language,
      });
    },
    [dispatch],
  );

  const removeMapping = useCallback(
    (tokenKey: string, tokenType: TokenType) => {
      void dispatch({
        type: MappingsCardActionType.MappingSemanticTokenVariantRemoveButtonOnClick,
        tokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const setMappingSearchText = useCallback(
    (value: string) => {
      void dispatch({ type: MappingsCardActionType.MappingSearchTextOnChange, value });
    },
    [dispatch],
  );

  const setMappingColorVariableFilter = useCallback(
    (values: ColorVariableKey[]) => {
      void dispatch({
        type: MappingsCardActionType.MappingColorVariableFilterListOnSelect,
        values,
      });
    },
    [dispatch],
  );

  const setMappingContrastVariableFilter = useCallback(
    (values: ContrastVariableKey[]) => {
      void dispatch({
        type: MappingsCardActionType.MappingContrastVariableFilterListOnSelect,
        values,
      });
    },
    [dispatch],
  );

  const setMappingStyleVariableFilter = useCallback(
    (values: StyleVariableKey[]) => {
      void dispatch({
        type: MappingsCardActionType.MappingStyleVariableFilterListOnSelect,
        values,
      });
    },
    [dispatch],
  );

  const toggleMappingSelection = useCallback(
    (mappingId: TemplateMappingId) => {
      void dispatch({
        type: MappingsCardActionType.MappingSelectionOnToggle,
        mappingId,
      });
    },
    [dispatch],
  );

  const clearMappingSelection = useCallback(() => {
    void dispatch({ type: MappingsCardActionType.MappingSelectionOnClear });
  }, [dispatch]);

  const setMappingGroupSelection = useCallback(
    (groupRef: string | null, checked: boolean) => {
      void dispatch({
        type: MappingsCardActionType.MappingGroupSelectionOnChange,
        groupRef,
        checked,
      });
    },
    [dispatch],
  );

  const setMappingTokenTypeSelection = useCallback(
    (groupRef: string | null, tokenType: TokenType, checked: boolean) => {
      void dispatch({
        type: MappingsCardActionType.MappingTokenTypeSelectionOnChange,
        groupRef,
        tokenType,
        checked,
      });
    },
    [dispatch],
  );

  const applySelectedMappingAssignment = useCallback(
    (assignment: TemplateMappingAssignment) => {
      void dispatch({
        type: MappingsCardActionType.MappingSelectedAssignmentOnCommit,
        assignment,
      });
    },
    [dispatch],
  );

  const sortedGroups = useMemo(
    () => [...(template?.groups ?? EMPTY_GROUPS)].sort((a, b) => a.localeCompare(b)),
    [template?.groups],
  );

  const sortedColorVariables = useMemo(
    () => [...(template?.colorVariables ?? EMPTY_COLOR_VARIABLES)].sort((a, b) => a.key.localeCompare(b.key)),
    [template?.colorVariables],
  );

  const sortedContrastVariables = useMemo(
    () => [...(template?.contrastVariables ?? EMPTY_CONTRAST_VARIABLES)].sort((a, b) => a.key.localeCompare(b.key)),
    [template?.contrastVariables],
  );

  const sortedStyleVariables = useMemo(
    () => [...(template?.styleVariables ?? EMPTY_STYLE_VARIABLES)].sort((a, b) => a.key.localeCompare(b.key)),
    [template?.styleVariables],
  );

  const sortedSemanticTokenModifiers = useMemo(
    () => [...(template?.semanticTokenModifiers ?? EMPTY_STRINGS)].sort((a, b) => a.localeCompare(b)),
    [template?.semanticTokenModifiers],
  );

  const sortedSemanticTokenLanguages = useMemo(
    () => [...(template?.semanticTokenLanguages ?? EMPTY_STRINGS)].sort((a, b) => a.localeCompare(b)),
    [template?.semanticTokenLanguages],
  );

  const semanticVariant = useMemo(
    () =>
      template === null
        ? undefined
        : {
            onAddSemanticVariant: addSemanticVariantMapping,
            onCommitSemanticTokenModifiers: commitSemanticTokenModifiers,
            onCommitSemanticTokenLanguage: commitSemanticTokenLanguage,
          },
    [
      template,
      addSemanticVariantMapping,
      commitSemanticTokenModifiers,
      commitSemanticTokenLanguage,
    ],
  );

  const filteredMappingsByType = useMemo(() => {
    return Object.fromEntries(
      DISPLAYED_TOKEN_TYPES.map((tt) => [
        tt,
        filterMappings(
          mappingsByType[tt],
          mappingSearchText,
          mappingColorVariableFilter,
          mappingContrastVariableFilter,
          mappingStyleVariableFilter,
        ).sort((a, b) => a.token.key.localeCompare(b.token.key)),
      ]),
    ) as Record<TokenType, Mapping[]>;
  }, [
    mappingsByType,
    mappingSearchText,
    mappingColorVariableFilter,
    mappingContrastVariableFilter,
    mappingStyleVariableFilter,
  ]);

  const mappingsByGroup = useMemo(() => {
    const byGroup = buildByGroup(filteredMappingsByType);
    if (template !== null && !byGroup.has(UNGROUPED_KEY)) {
      byGroup.set(UNGROUPED_KEY, {
        theme: [],
        'textmate token': [],
        'semantic token': [],
      });
    }
    return byGroup;
  }, [filteredMappingsByType, template]);

  const groupKeysInOrder = useMemo(() => sortedGroupKeys(mappingsByGroup), [mappingsByGroup]);

  const selectedVisibleMappingIds = useMemo(() => {
    return DISPLAYED_TOKEN_TYPES.flatMap((tt) =>
      filteredMappingsByType[tt]
        .map(mappingIdFromMapping)
        .filter((id) => selectedMappingKeys.has(templateMappingIdKey(id))),
    );
  }, [filteredMappingsByType, selectedMappingKeys]);

  const groupSelectionStates = useMemo(() => {
    const states = new Map<string, TriState>();
    if (!template) return states;

    const allByGroup = buildByGroup(mappingsByType);
    if (!allByGroup.has(UNGROUPED_KEY)) {
      allByGroup.set(UNGROUPED_KEY, {
        theme: [],
        'textmate token': [],
        'semantic token': [],
      });
    }

    for (const [groupKey, byType] of allByGroup) {
      const ids = DISPLAYED_TOKEN_TYPES.flatMap((tt) => byType[tt].map(mappingIdFromMapping));
      const selectedCount = ids.filter((id) => selectedMappingKeys.has(templateMappingIdKey(id))).length;
      const state: TriState = selectedCount === 0
        ? 'none'
        : selectedCount === ids.length
          ? 'all'
          : 'some';
      states.set(groupKey, ids.length === 0 ? 'none' : state);
    }

    return states;
  }, [mappingsByType, selectedMappingKeys, template]);

  const tokenTypeSelectionStates = useMemo(() => {
    const states = new Map<string, TriState>();
    if (!template) return states;

    const allByGroup = buildByGroup(mappingsByType);
    if (!allByGroup.has(UNGROUPED_KEY)) {
      allByGroup.set(UNGROUPED_KEY, {
        theme: [],
        'textmate token': [],
        'semantic token': [],
      });
    }

    for (const [groupKey, byType] of allByGroup) {
      for (const tt of DISPLAYED_TOKEN_TYPES) {
        const ids = byType[tt].map(mappingIdFromMapping);
        const selectedCount = ids.filter((id) => selectedMappingKeys.has(templateMappingIdKey(id))).length;
        const state: TriState = selectedCount === 0
          ? 'none'
          : selectedCount === ids.length
            ? 'all'
            : 'some';
        states.set(`${groupKey}::${tt}`, ids.length === 0 ? 'none' : state);
      }
    }

    return states;
  }, [mappingsByType, selectedMappingKeys, template]);

  const selectedMappings = useMemo(() => {
    if (!template) return [];
    return template.mappings.filter((mapping) => selectedMappingKeys.has(templateMappingIdKey(mappingIdFromMapping(mapping))));
  }, [selectedMappingKeys, template]);

  const selectedMappingAssignmentValues = useMemo(
    () => ({
      group: getUniformValue(selectedMappings, (mapping) => mapping.groupRef ?? null),
      color: getUniformValue(selectedMappings, (mapping) => mapping.colorVariableRef ?? null),
      contrast: getUniformValue(selectedMappings, (mapping) => mapping.contrastVariableRef ?? null),
      style: getUniformValue(selectedMappings, (mapping) => mapping.styleVariableRef ?? null),
      ignored: getUniformValue(selectedMappings, (mapping) => mapping.ignored === true),
    }),
    [selectedMappings],
  );

  return {
    template,
    mappingsByType,
    mappingsByGroup,
    groupKeysInOrder,
    sortedGroups,
    sortedColorVariables,
    sortedContrastVariables,
    sortedStyleVariables,
    sortedSemanticTokenModifiers,
    sortedSemanticTokenLanguages,
    orphanKeys,
    canEdit,
    mappingSearchText,
    mappingColorVariableFilter,
    mappingContrastVariableFilter,
    mappingStyleVariableFilter,
    selectedMappingIds,
    selectedVisibleMappingIds,
    selectedMappingKeys,
    groupSelectionStates,
    tokenTypeSelectionStates,
    selectedMappingAssignmentValues,
    onUpdateGroupRef: updateMappingGroupRef,
    onUpdateColorRef: updateMappingColorRef,
    onUpdateContrastRef: updateMappingContrastRef,
    onUpdateStyleRef: updateMappingStyleRef,
    onUpdateIgnored: updateMappingIgnored,
    semanticVariant,
    onRemoveMapping: removeMapping,
    setMappingSearchText,
    setMappingColorVariableFilter,
    setMappingContrastVariableFilter,
    setMappingStyleVariableFilter,
    toggleMappingSelection,
    setMappingGroupSelection,
    setMappingTokenTypeSelection,
    clearMappingSelection,
    applySelectedMappingAssignment,
  };
}
