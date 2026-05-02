import { useCallback, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { getTemplateRefs } from '../../../domain/state/template/templates-state';
import { compareVersions } from '../../../domain/utils/compare-versions';
import type { Catalog, Token } from '../../../model/schema/catalog';
import type { ColorVariableKey, ContrastVariableKey, TokenType } from '../../../model/schema/primitives';
import type { CatalogReference, Mapping, Template } from '../../../model/schema/template-schemas';
import { MappingsCardActionType } from './actions/mappings-card-action-type';
import { computeOrphanKeys, type SemanticCatalogInfo } from '../../../domain/utils/compute-orphan-keys';
import { CatalogsStore } from '../../../domain/state/catalog/catalogs-store';
import { TemplatesStore } from '../../../domain/state/template/templates-store';
import { container } from 'tsyringe';

const catalogsStore = container.resolve(CatalogsStore);
const templatesStore = container.resolve(TemplatesStore);

export function useMappingsCardViewModel() {
  const orphanKeysStashRef = useRef<Set<string>>(new Set());
  const dispatch = useAppDispatch();
  const selectedRef = useStore(templatesStore.api, (state) => state.state.selectedRef);
  const template: Template | null = useStore(templatesStore.api, (state) => state.state.template);
  const templateMap = useStore(templatesStore.api, (state) => state.state.templateMap);
  const mappingSearchText = useStore(templatesStore.api, (state) => state.state.mappingSearchText);
  const mappingColorVariableFilter = useStore(templatesStore.api, (state) => state.state.mappingColorVariableFilter);
  const mappingContrastVariableFilter = useStore(templatesStore.api, (state) => state.state.mappingContrastVariableFilter);

  const catalogMap = useStore(catalogsStore.api, (state) => state.stateV2.catalogs);

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

  const semanticVariant =
    template === null
      ? undefined
      : {
          semanticTokenModifiers: template.semanticTokenModifiers ?? [],
          semanticTokenLanguages: template.semanticTokenLanguages ?? [],
          onAddSemanticVariant: addSemanticVariantMapping,
          onCommitSemanticTokenModifiers: commitSemanticTokenModifiers,
          onCommitSemanticTokenLanguage: commitSemanticTokenLanguage,
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
