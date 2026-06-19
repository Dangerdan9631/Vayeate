import { useCallback, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { compareVersions } from '../../../domain/utils/compare-versions';
import type { Catalog, Token } from '../../../model/schema/catalog';
import type { ColorVariableKey, ContrastVariableKey, TokenType } from '../../../model/schema/primitives';
import type { CatalogReference, ColorVariable, ContrastVariable, Mapping, Template } from '../../../model/schema/template-schemas';
import { MappingsCardActionType } from './actions/mappings-card-action-type';
import { computeOrphanKeys, type SemanticCatalogInfo } from '../../../domain/utils/compute-orphan-keys';
import { CatalogsStore } from '../../../domain/catalog/state/catalogs-store';
import { getCurrentTemplate, getCurrentTemplateRefs, TemplatesStore } from '../../../domain/state/data/templates-store';
import { TemplateUiStore } from '../../../domain/state/ui/template-ui-store';
import { container } from 'tsyringe';

const catalogsStore = container.resolve(CatalogsStore);
const templatesStore = container.resolve(TemplatesStore);
const templateUiStore = container.resolve(TemplateUiStore);

const EMPTY_GROUPS: readonly string[] = [];
const EMPTY_COLOR_VARIABLES: readonly ColorVariable[] = [];
const EMPTY_CONTRAST_VARIABLES: readonly ContrastVariable[] = [];
const EMPTY_STRINGS: readonly string[] = [];
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
    return true;
  });
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

/**
 * Subscribes to template mappings, catalogs, and filter state for the mappings card.
 * @returns Mappings card state and dispatch-backed handlers.
 */
export function useMappingsCardViewModel() {
  const orphanKeysStashRef = useRef<Set<string>>(new Set());
  const dispatch = useAppDispatch();
  const selectedRef = useStore(templateUiStore.api, (state) => state.state.selectedRef);
  const templateMap = useStore(templatesStore.api, (state) => state.state.templates);
  const template: Template | null = useMemo(() => getCurrentTemplate(templateMap, selectedRef), [templateMap, selectedRef]);
  const mappingSearchText = useStore(templateUiStore.api, (state) => state.state.mappingSearchText);
  const mappingColorVariableFilter = useStore(
    templateUiStore.api,
    useShallow((state) => state.state.mappingColorVariableFilter),
  );
  const mappingContrastVariableFilter = useStore(
    templateUiStore.api,
    useShallow((state) => state.state.mappingContrastVariableFilter),
  );

  const catalogMap = useStore(catalogsStore.api, (state) => state.state.catalogs);

  const loadedCatalogsForTemplateRefs = useMemo(() => {
    if (!template || template.catalogRefs.length === 0) return [];
    return template.catalogRefs.map((ref: CatalogReference) => {
      const catalogEntry = catalogMap[ref.name]?.[ref.version];
      if (!catalogEntry || !catalogEntry.isLoaded) return null;
      return catalogEntry.catalog;
    });
  }, [template, catalogMap]);

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

  const templateRefs = useMemo(() => getCurrentTemplateRefs(templateMap), [templateMap]);
  const selectedName = selectedRef?.name ?? null;

  const isLatestVersion = useMemo(() => {
    if (!selectedRef || !selectedName) return false;
    const best = templateRefs
      .filter((r) => r.name === selectedName)
      .reduce(
        (acc, r) => (!acc || compareVersions(r.version, acc.version) > 0 ? r : acc),
        null as (typeof templateRefs)[number] | null,
      );
    return best !== null && best.version === selectedRef.version;
  }, [templateRefs, selectedRef, selectedName]);

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
        ).sort((a, b) => a.token.key.localeCompare(b.token.key)),
      ]),
    ) as Record<TokenType, Mapping[]>;
  }, [
    mappingsByType,
    mappingSearchText,
    mappingColorVariableFilter,
    mappingContrastVariableFilter,
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

  return {
    template,
    mappingsByType,
    mappingsByGroup,
    groupKeysInOrder,
    sortedGroups,
    sortedColorVariables,
    sortedContrastVariables,
    sortedSemanticTokenModifiers,
    sortedSemanticTokenLanguages,
    orphanKeys,
    canEdit,
    mappingSearchText,
    mappingColorVariableFilter,
    mappingContrastVariableFilter,
    onUpdateGroupRef: updateMappingGroupRef,
    onUpdateColorRef: updateMappingColorRef,
    onUpdateContrastRef: updateMappingContrastRef,
    semanticVariant,
    onRemoveMapping: removeMapping,
    setMappingSearchText,
    setMappingColorVariableFilter,
    setMappingContrastVariableFilter,
  };
}
