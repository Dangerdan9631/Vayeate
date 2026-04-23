import { useCallback, useMemo } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import { getTemplateRefs } from '../../../../domain/state/template/templates-state';
import { compareVersions } from '../../../../domain/utils/compare-versions';
import type { ColorVariableKey, ContrastVariableKey } from '../../../../model/schema/primitives';
import { VariablesCardActionType } from './actions/variables-card-action-type';
import { container } from 'tsyringe';
import { TemplatesStore } from '../../../../domain/state/template/templates-store';

const templatesStore = container.resolve(TemplatesStore);

export function useVariablesCardViewModel() {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(templatesStore.api, (state) => state.state.selectedRef);
  const template = useStore(templatesStore.api, (state) => state.state.template);
  const templateMap = useStore(templatesStore.api, (state) => state.state.templateMap);
  const variablesSearchText = useStore(templatesStore.api, (state) => state.state.variablesSearchText);
  const addVariableName = useStore(templatesStore.api, (state) => state.state.addVariableName);

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

  const handleVariablesSearchChange = useCallback(
    (value: string) => {
      dispatch({ type: VariablesCardActionType.VariablesSearchTextOnChange, value });
    },
    [dispatch],
  );

  const handleAddVariableNameChange = useCallback(
    (value: string) => {
      dispatch({ type: VariablesCardActionType.VariablesAddVariableNameTextOnChange, value });
    },
    [dispatch],
  );

  const addColorVariable = useCallback(
    (groupRef?: string | null) => {
      dispatch({
        type: VariablesCardActionType.VariablesAddVariableButtonOnClick,
        groupRef: groupRef ?? null,
        variableKind: 'color',
      });
    },
    [dispatch],
  );

  const removeColorVariable = useCallback(
    (key: string) => {
      dispatch({ type: VariablesCardActionType.VariablesRemoveButtonOnClick, key });
    },
    [dispatch],
  );

  const addContrastVariable = useCallback(
    (groupRef?: string | null) => {
      dispatch({
        type: VariablesCardActionType.VariablesAddVariableButtonOnClick,
        groupRef: groupRef ?? null,
        variableKind: 'contrast',
      });
    },
    [dispatch],
  );

  const removeContrastVariable = useCallback(
    (key: string) => {
      dispatch({ type: VariablesCardActionType.VariablesRemoveButtonOnClick, key });
    },
    [dispatch],
  );

  const updateContrastComparisonSource = useCallback(
    (key: string, comparisonSourceRef: ColorVariableKey | null) => {
      dispatch({
        type: VariablesCardActionType.VariablesContrastSourceListOnCommit,
        value: comparisonSourceRef,
        contrastVariableKey: key as ContrastVariableKey,
      });
    },
    [dispatch],
  );

  const updateColorVariableGroupRef = useCallback(
    (key: string, groupRef: string | null) => {
      dispatch({
        type: VariablesCardActionType.VariablesGroupListOnCommit,
        value: groupRef ?? '',
        variableKey: key,
      });
    },
    [dispatch],
  );

  const updateContrastVariableGroupRef = useCallback(
    (key: string, groupRef: string | null) => {
      dispatch({
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
    handleAddVariableNameChange,
    referencedColorVarKeys,
    referencedContrastVarKeys,
    canEdit,
    onAddColorVariable: addColorVariable,
    onRemoveColorVariable: removeColorVariable,
    onAddContrastVariable: addContrastVariable,
    onRemoveContrastVariable: removeContrastVariable,
    onUpdateColorVariableGroupRef: updateColorVariableGroupRef,
    onUpdateContrastVariableGroupRef: updateContrastVariableGroupRef,
    onUpdateContrastComparisonSource: updateContrastComparisonSource,
    handleVariablesSearchChange,
  };
}
