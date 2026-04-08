import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { useTemplatesState } from '../context/use-templates-state';
import { getTemplateRefs } from '../../../domain/state/template/templates-state';
import { compareVersions } from '../../../domain/utils/version';
import { TemplateActionType } from '../actions/template-action-type';

export function useTemplateDetailsCardViewModel() {
  const dispatch = useAppDispatch();
  const { selectedRef, template, templateMap } = useTemplatesState();
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

  const canLock = useMemo(() => {
    if (!template || template.locked || !isLatestVersion) return false;
    return template.mappings.every((m) => m.colorVariableRef !== null);
  }, [template, isLatestVersion]);

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

  const onDeleteVersion = useCallback(() => {
    if (selectedRef) deleteVersion(selectedRef.name, selectedRef.version);
  }, [deleteVersion, selectedRef]);

  return {
    template,
    isLatestVersion,
    canLock,
    onDeleteVersion,
    onLock: lockTemplate,
  };
}
