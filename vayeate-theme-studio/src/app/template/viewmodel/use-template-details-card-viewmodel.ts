import { useCallback, useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/app-context';
import { getTemplateRefs } from '../../../domain/state/template/templates-state';
import { compareVersions } from '../../../domain/utils/compare-versions';
import { TemplateActionType } from '../actions/template-action-type';

export function useTemplateDetailsCardViewModel() {
  const dispatch = useAppDispatch();
  const { selectedRef, template, templateMap } = useContextSelector(AppContext, (c) => {
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

  const canLock = useMemo(() => {
    if (!template || template.locked || !isLatestVersion) return false;
    return template.mappings.every((m) => m.colorVariableRef !== null);
  }, [template, isLatestVersion]);

  const lockTemplate = useCallback(() => {
    if (!template || !canLock) return;
    dispatch({ type: TemplateActionType.TemplateDetailsLockButtonOnClick });
  }, [template, canLock, dispatch]);

  const onDeleteVersion = useCallback(() => {
    if (!selectedRef) return;
    dispatch({ type: TemplateActionType.TemplateDetailsDeleteVersionButtonOnClick });
  }, [dispatch, selectedRef]);

  return {
    template,
    isLatestVersion,
    canLock,
    onDeleteVersion,
    onLock: lockTemplate,
  };
}
