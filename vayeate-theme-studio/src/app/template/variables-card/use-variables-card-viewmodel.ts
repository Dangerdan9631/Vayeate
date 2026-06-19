import { useCallback, useMemo } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { compareVersions } from '../../../domain/utils/compare-versions';
import {
  colorVariableKeySchema,
  contrastVariableKeySchema,
  type ColorVariableKey,
  type ContrastVariableKey,
} from '../../../model/schema/primitives';
import { VariablesCardActionType } from './actions/variables-card-action-type';
import { container } from 'tsyringe';
import { getCurrentTemplate, getCurrentTemplateRefs, TemplatesStore } from '../../../domain/state/data/templates-store';
import { TemplateUiStore } from '../../../domain/state/ui/template-ui-store';
import type { ColorVariable, ContrastVariable, Template } from '../../../model/schema/template-schemas';

const templatesStore = container.resolve(TemplatesStore);
const templateUiStore = container.resolve(TemplateUiStore);

const EMPTY_COLOR_VARIABLES: readonly ColorVariable[] = [];
const EMPTY_CONTRAST_VARIABLES: readonly ContrastVariable[] = [];
const EMPTY_GROUPS: readonly string[] = [];
const UNGROUPED_KEY = '__ungrouped__';
const EMPTY_GROUP_SECTIONS: readonly VariableGroupSection<never>[] = [];

/**
 * One grouped subsection of variables ready for list rendering.
 */
export interface VariableGroupSection<T> {
  groupKey: string;
  groupLabel: string;
  groupRef: string | null;
  variables: readonly T[];
}

function matchesSearch(key: string, searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  return !q || key.toLowerCase().includes(q);
}

function buildByGroup<T extends { groupRef?: string | null }>(
  items: readonly T[],
): Map<string, T[]> {
  const byGroup = new Map<string, T[]>();
  for (const v of items) {
    const groupKey = v.groupRef ?? UNGROUPED_KEY;
    let list = byGroup.get(groupKey);
    if (!list) {
      list = [];
      byGroup.set(groupKey, list);
    }
    list.push(v);
  }
  return byGroup;
}

function sortedGroupKeys(byGroup: Map<string, unknown[]>): string[] {
  const named = [...byGroup.keys()].filter((k) => k !== UNGROUPED_KEY).sort();
  const hasUngrouped = byGroup.has(UNGROUPED_KEY);
  return hasUngrouped ? [...named, UNGROUPED_KEY] : named;
}

function buildVariableGroupSections<T extends { groupRef?: string | null }>(
  items: readonly T[],
): VariableGroupSection<T>[] {
  const byGroup = buildByGroup(items);
  const groupKeysInOrder = sortedGroupKeys(byGroup);
  const keysToRender = groupKeysInOrder.length > 0 ? groupKeysInOrder : [UNGROUPED_KEY];
  return keysToRender.map((groupKey) => ({
    groupKey,
    groupLabel: groupKey === UNGROUPED_KEY ? 'Ungrouped' : groupKey,
    groupRef: groupKey === UNGROUPED_KEY ? null : groupKey,
    variables: byGroup.get(groupKey) ?? [],
  }));
}

/**
 * Read model and action callbacks for the template variables card.
 */
export interface VariablesCardViewModel {
  template: Template | null;
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
  groups: readonly string[];
  sortedGroups: readonly string[];
  filteredColorVariables: readonly ColorVariable[];
  filteredContrastVariables: readonly ContrastVariable[];
  sortedColorVariables: readonly ColorVariable[];
  colorVariableGroupSections: readonly VariableGroupSection<ColorVariable>[];
  contrastVariableGroupSections: readonly VariableGroupSection<ContrastVariable>[];
  variablesSearchText: string;
  addVariableName: string;
  canEdit: boolean;
  canAddColorVariable: boolean;
  canAddContrastVariable: boolean;
  referencedColorVarKeys: Set<string>;
  referencedContrastVarKeys: Set<string>;
  onAddVariableNameChange: (value: string) => void;
  onAddColorVariableClick: (groupRef: string | null) => void;
  onRemoveColorVariableClick: (key: string) => void;
  onAddContrastVariableClick: (groupRef: string | null) => void;
  onRemoveContrastVariableClick: (key: string) => void;
  onUpdateColorVariableGroupRef: (key: string, groupRef: string | null) => void;
  onUpdateContrastVariableGroupRef: (key: string, groupRef: string | null) => void;
  onUpdateContrastComparisonSource: (key: string, ref: ColorVariableKey | null) => void;
  onVariablesSearchChange: (value: string) => void;
}

function isValidVariableKey(value: string, type: 'color' | 'contrast'): boolean {
  const schema = type === 'color' ? colorVariableKeySchema : contrastVariableKeySchema;
  return schema.safeParse(value).success;
}

/**
 * Subscribes to template variables and exposes search and edit callbacks.
 * @returns Variables card state and dispatch-backed handlers.
 */
export function useVariablesCardViewModel(): VariablesCardViewModel {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(templateUiStore.api, (state) => state.state.selectedRef);
  const templateMap = useStore(templatesStore.api, (state) => state.state.templates);
  const template = useMemo(() => getCurrentTemplate(templateMap, selectedRef), [templateMap, selectedRef]);
  const variablesSearchText = useStore(templateUiStore.api, (state) => state.state.variablesSearchText);
  const addVariableName = useStore(templateUiStore.api, (state) => state.state.addVariableName);

  const colorVariables = useMemo(
    () => template?.colorVariables ?? EMPTY_COLOR_VARIABLES,
    [template?.colorVariables],
  );
  const contrastVariables = useMemo(
    () => template?.contrastVariables ?? EMPTY_CONTRAST_VARIABLES,
    [template?.contrastVariables],
  );
  const groups = useMemo(() => template?.groups ?? EMPTY_GROUPS, [template?.groups]);

  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.localeCompare(b)),
    [groups],
  );

  const filteredColorVariables = useMemo(
    () =>
      colorVariables
        .filter((v) => matchesSearch(v.key, variablesSearchText))
        .sort((a, b) => a.key.localeCompare(b.key)),
    [colorVariables, variablesSearchText],
  );

  const filteredContrastVariables = useMemo(
    () =>
      contrastVariables
        .filter((v) => matchesSearch(v.key, variablesSearchText))
        .sort((a, b) => a.key.localeCompare(b.key)),
    [contrastVariables, variablesSearchText],
  );

  const sortedColorVariables = useMemo(
    () => [...colorVariables].sort((a, b) => a.key.localeCompare(b.key)),
    [colorVariables],
  );

  const colorVariableGroupSections = useMemo(
    () => (template ? buildVariableGroupSections(filteredColorVariables) : EMPTY_GROUP_SECTIONS),
    [template, filteredColorVariables],
  );

  const contrastVariableGroupSections = useMemo(
    () => (template ? buildVariableGroupSections(filteredContrastVariables) : EMPTY_GROUP_SECTIONS),
    [template, filteredContrastVariables],
  );

  const templateRefs = useMemo(() => getCurrentTemplateRefs(templateMap), [templateMap]);
  const selectedName = useMemo(() => selectedRef?.name ?? null, [selectedRef]);

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

  const canEdit = useMemo(() => template !== null && isLatestVersion, [template, isLatestVersion]);
  const canAddColorVariable = useMemo(
    () => canEdit && isValidVariableKey(addVariableName.trim(), 'color'),
    [addVariableName, canEdit],
  );
  const canAddContrastVariable = useMemo(
    () => canEdit && isValidVariableKey(addVariableName.trim(), 'contrast'),
    [addVariableName, canEdit],
  );

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

  const onVariablesSearchChange = useCallback(
    (value: string) => {
      void dispatch({ type: VariablesCardActionType.VariablesSearchTextOnChange, value });
    },
    [dispatch],
  );

  const onAddVariableNameChange = useCallback(
    (value: string) => {
      void dispatch({ type: VariablesCardActionType.VariablesAddVariableNameTextOnChange, value });
    },
    [dispatch],
  );

  const addColorVariable = useCallback(
    (groupRef?: string | null) => {
      if (!canAddColorVariable) return;
      void dispatch({
        type: VariablesCardActionType.VariablesAddVariableButtonOnClick,
        groupRef: groupRef ?? null,
        variableKind: 'color',
      });
    },
    [canAddColorVariable, dispatch],
  );

  const removeColorVariable = useCallback(
    (key: string) => {
      void dispatch({ type: VariablesCardActionType.VariablesRemoveButtonOnClick, key });
    },
    [dispatch],
  );

  const addContrastVariable = useCallback(
    (groupRef?: string | null) => {
      if (!canAddContrastVariable) return;
      void dispatch({
        type: VariablesCardActionType.VariablesAddVariableButtonOnClick,
        groupRef: groupRef ?? null,
        variableKind: 'contrast',
      });
    },
    [canAddContrastVariable, dispatch],
  );

  const removeContrastVariable = useCallback(
    (key: string) => {
      void dispatch({ type: VariablesCardActionType.VariablesRemoveButtonOnClick, key });
    },
    [dispatch],
  );

  const updateContrastComparisonSource = useCallback(
    (key: string, comparisonSourceRef: ColorVariableKey | null) => {
      void dispatch({
        type: VariablesCardActionType.VariablesContrastSourceListOnCommit,
        value: comparisonSourceRef,
        contrastVariableKey: key as ContrastVariableKey,
      });
    },
    [dispatch],
  );

  const updateColorVariableGroupRef = useCallback(
    (key: string, groupRef: string | null) => {
      void dispatch({
        type: VariablesCardActionType.VariablesGroupListOnCommit,
        value: groupRef ?? '',
        variableKey: key,
      });
    },
    [dispatch],
  );

  const updateContrastVariableGroupRef = useCallback(
    (key: string, groupRef: string | null) => {
      void dispatch({
        type: VariablesCardActionType.VariablesGroupListOnCommit,
        value: groupRef ?? '',
        variableKey: key,
      });
    },
    [dispatch],
  );

  return {
    template,
    colorVariables,
    contrastVariables,
    groups,
    sortedGroups,
    filteredColorVariables,
    filteredContrastVariables,
    sortedColorVariables,
    colorVariableGroupSections,
    contrastVariableGroupSections,
    variablesSearchText,
    addVariableName,
    canAddColorVariable,
    canAddContrastVariable,
    onAddVariableNameChange,
    referencedColorVarKeys,
    referencedContrastVarKeys,
    canEdit,
    onAddColorVariableClick: addColorVariable,
    onRemoveColorVariableClick: removeColorVariable,
    onAddContrastVariableClick: addContrastVariable,
    onRemoveContrastVariableClick: removeContrastVariable,
    onUpdateColorVariableGroupRef: updateColorVariableGroupRef,
    onUpdateContrastVariableGroupRef: updateContrastVariableGroupRef,
    onUpdateContrastComparisonSource: updateContrastComparisonSource,
    onVariablesSearchChange,
  };
}
