import { useCallback, useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/app-context';
import { getTemplateRefs } from '../../../domain/state/template/templates-state';
import { compareVersions } from '../../../domain/utils/version';
import { TemplateActionType } from '../actions/template-action-type';

export function useGroupsCardViewModel() {
  const dispatch = useAppDispatch();
  const { selectedRef, template, templateMap, addGroupName } = useContextSelector(AppContext, (c) => {
    const slice = c?.state.templates;
    if (slice === undefined) {
      throw new Error('Template state requires AppProvider.');
    }
    return slice;
  });

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

  const groups = template?.groups ?? [];

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

  const removeGroup = useCallback(
    (name: string) => {
      dispatch({ type: TemplateActionType.TemplateGroupRemoveButtonOnClick, groupId: name });
    },
    [dispatch],
  );

  const handleAddGroupNameChange = useCallback(
    (value: string) => {
      dispatch({ type: TemplateActionType.TemplateGroupAddTextOnChange, value });
    },
    [dispatch],
  );

  const trimmed = addGroupName.trim();
  const canAdd = trimmed.length > 0 && !groups.includes(trimmed);

  const handleAddGroup = useCallback(() => {
    if (!canAdd) return;
    dispatch({ type: TemplateActionType.TemplateGroupAddButtonOnClick });
  }, [canAdd, dispatch]);

  return {
    template,
    groups,
    groupNamesInUse,
    canEdit,
    addGroupName,
    canAdd,
    onRemoveGroup: removeGroup,
    handleAddGroupNameChange,
    handleAddGroup,
  };
}
