import { useCallback, useMemo } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import { getTemplateRefs } from '../../../../domain/state/template/templates-state';
import { compareVersions } from '../../../../domain/utils/compare-versions';
import { TemplateDetailsCardActionType } from './actions/template-details-card-action-type';
import { container } from 'tsyringe';
import { TemplatesStore } from '../../../../domain/state/template/templates-store';
import type { Mapping } from '../../../../model/schema/template-schemas';

const templatesStore = container.resolve(TemplatesStore);

export function useTemplateDetailsCardViewModel() {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(templatesStore.api, (state) => state.state.selectedRef);
  const template = useStore(templatesStore.api, (state) => state.state.template);
  const templateMap = useStore(templatesStore.api, (state) => state.state.templateMap);
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
    return template.mappings.every((m: Mapping) => m.colorVariableRef !== null);
  }, [template, isLatestVersion]);

  const lockTemplate = useCallback(() => {
    if (!template || !canLock) return;
    dispatch({ type: TemplateDetailsCardActionType.LockButtonOnClick });
  }, [template, canLock, dispatch]);

  const onDeleteVersion = useCallback(() => {
    if (!selectedRef) return;
    dispatch({ type: TemplateDetailsCardActionType.DeleteVersionButtonOnClick });
  }, [dispatch, selectedRef]);

  return {
    template,
    isLatestVersion,
    canLock,
    onDeleteVersion,
    onLock: lockTemplate,
  };
}
