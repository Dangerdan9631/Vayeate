import { useCallback, useMemo } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { getTemplateRefs } from '../../../domain/state/template/templates-state';
import { compareVersions } from '../../../domain/utils/compare-versions';
import {
  colorVariableKeySchema,
  contrastVariableKeySchema,
  type ColorVariableKey,
  type ContrastVariableKey,
} from '../../../model/schema/primitives';
import { VariablesCardActionType } from './actions/variables-card-action-type';
import { container } from 'tsyringe';
import { TemplatesStore } from '../../../domain/state/template/templates-store';
import type { ColorVariable, ContrastVariable, Template } from '../../../model/schema/template-schemas';

const templatesStore = container.resolve(TemplatesStore);

export interface VariablesCardViewModel {
  template: Template | null;
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
  groups: readonly string[];
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

export function useVariablesCardViewModel(): VariablesCardViewModel {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(templatesStore.api, (state) => state.state.selectedRef);
  const template = useStore(templatesStore.api, (state) => state.state.template);
  const templateMap = useStore(templatesStore.api, (state) => state.state.templateMap);
  const variablesSearchText = useStore(templatesStore.api, (state) => state.state.variablesSearchText);
  const addVariableName = useStore(templatesStore.api, (state) => state.state.addVariableName);

  const templateRefs = useMemo(() => getTemplateRefs(templateMap), [templateMap]);
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
    colorVariables: template?.colorVariables ?? [],
    contrastVariables: template?.contrastVariables ?? [],
    groups: template?.groups ?? [],
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
