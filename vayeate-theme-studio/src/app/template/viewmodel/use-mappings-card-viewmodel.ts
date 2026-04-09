import { useCallback, useMemo, useRef } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/components/AppProvider';
import { getTemplateRefs } from '../../../domain/state/template/templates-state';
import { compareVersions } from '../../../domain/utils/version';
import type {
  Catalog,
  ColorVariableKey,
  ContrastVariableKey,
  Mapping,
  Token,
  TokenType,
} from '../../../model/schemas';
import { TemplateActionType } from '../actions/template-action-type';
import { computeOrphanKeys, type SemanticCatalogInfo } from '../../../domain/utils/orphan-mappings';

export function useMappingsCardViewModel() {
  const orphanKeysStashRef = useRef<Set<string>>(new Set());
  const dispatch = useAppDispatch();
  const templatesState = useContextSelector(AppContext, (c) => {
    const slice = c?.state.templates;
    if (slice === undefined) {
      throw new Error('Template state requires AppProvider.');
    }
    return slice;
  });
  const {
    selectedRef,
    template,
    templateMap,
    mappingSearchText,
    mappingColorVariableFilter,
    mappingContrastVariableFilter,
  } = templatesState;

  const loadedForDisplay = useContextSelector(AppContext, (c) => {
    const slice = c?.state.catalogs;
    if (slice === undefined) {
      throw new Error('Catalog state requires AppProvider.');
    }
    return slice.loadedForDisplay;
  });

  const loadedCatalogsForTemplateRefs = useMemo(() => {
    if (!template || template.catalogRefs.length === 0) return [];
    return template.catalogRefs.map((ref) => {
      const key = `${ref.name}@${ref.version}`;
      return loadedForDisplay[key] ?? null;
    });
  }, [template, loadedForDisplay]);

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

  const templateRefs = useMemo(() => getTemplateRefs(templateMap), [templateMap]);
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
      dispatch({
        type: TemplateActionType.TemplateMappingExistingTokenColorVariableListOnCommit,
        value: colorRef as ColorVariableKey,
        tokenKey,
        tokenType,
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

  const setMappingSearchText = useCallback(
    (value: string) => {
      dispatch({ type: TemplateActionType.TemplateMappingSearchTextOnChange, value });
    },
    [dispatch],
  );

  const setMappingColorVariableFilter = useCallback(
    (values: ColorVariableKey[]) => {
      dispatch({
        type: TemplateActionType.TemplateMappingColorVariableFilterListOnSelect,
        values,
      });
    },
    [dispatch],
  );

  const setMappingContrastVariableFilter = useCallback(
    (values: ContrastVariableKey[]) => {
      dispatch({
        type: TemplateActionType.TemplateMappingContrastVariableFilterListOnSelect,
        values,
      });
    },
    [dispatch],
  );

  const semanticVariant =
    template === null
      ? undefined
      : {
          semanticTokenModifiers: template.semanticTokenModifiers ?? [],
          semanticTokenLanguages: template.semanticTokenLanguages ?? [],
          onAddSemanticVariant: addSemanticVariantMapping,
          onUpdateSemanticVariantKey: updateSemanticVariantKey,
        };

  return {
    template,
    mappingsByType,
    groups: template?.groups ?? [],
    colorVariables: template?.colorVariables ?? [],
    contrastVariables: template?.contrastVariables ?? [],
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
