import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { useTemplatesState } from '../context/use-templates-state';
import { getTemplateRefs } from '../../../domain/state/template/templates-state';
import { compareVersions } from '../../../domain/utils/version';
import type { ColorVariableKey, ContrastVariableKey } from '../../../model/schemas';
import { TemplateActionType } from '../actions/template-action-type';

export function useVariablesCardViewModel() {
  const dispatch = useAppDispatch();
  const { selectedRef, template, templateMap, variablesSearchText } = useTemplatesState();

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
      dispatch({ type: TemplateActionType.TemplateVariablesSearchTextOnChange, value });
    },
    [dispatch],
  );

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

  return {
    template,
    colorVariables: template?.colorVariables ?? [],
    contrastVariables: template?.contrastVariables ?? [],
    groups: template?.groups ?? [],
    variablesSearchText,
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
