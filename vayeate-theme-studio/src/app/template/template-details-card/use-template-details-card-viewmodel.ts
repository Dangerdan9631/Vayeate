import { useCallback, useMemo } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { compareVersions } from '../../../domain/utils/compare-versions';
import { TemplateDetailsCardActionType } from './actions/template-details-card-action-type';
import { container } from 'tsyringe';
import { getCurrentTemplate, getCurrentTemplateRefs, TemplatesStore } from '../../../domain/state/template/templates-store';
import type { Mapping, Template } from '../../../model/schema/template-schemas';

const templatesStore = container.resolve(TemplatesStore);

export interface TemplateDetailsCardViewModel {
  template: Template | null;
  isLatestVersion: boolean;
  canLock: boolean;
  canShowLockButton: boolean;
  lockButtonTitle: string;
  onDeleteVersionClick: () => void;
  onLockClick: () => void;
}

export function useTemplateDetailsCardViewModel(): TemplateDetailsCardViewModel {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(templatesStore.api, (state) => state.state.selectedRef);
  const template = useStore(templatesStore.api, getCurrentTemplate);
  const templateMap = useStore(templatesStore.api, (state) => state.state.templates);
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

  const canLock = useMemo(() => {
    if (!template || template.locked || !isLatestVersion) return false;
    return template.mappings.every((m: Mapping) => m.colorVariableRef !== null);
  }, [template, isLatestVersion]);
  const canShowLockButton = useMemo(() => template !== null && !template.locked && isLatestVersion, [template, isLatestVersion]);
  const lockButtonTitle = useMemo(
    () => canLock ? 'Lock this version' : 'All mappings must have a color variable assigned',
    [canLock],
  );

  const lockTemplate = useCallback(() => {
    if (!template || !canLock) return;
    void dispatch({ type: TemplateDetailsCardActionType.LockButtonOnClick });
  }, [template, canLock, dispatch]);

  const onDeleteVersion = useCallback(() => {
    if (!selectedRef) return;
    void dispatch({ type: TemplateDetailsCardActionType.DeleteVersionButtonOnClick });
  }, [dispatch, selectedRef]);

  return {
    template,
    isLatestVersion,
    canLock,
    canShowLockButton,
    lockButtonTitle,
    onDeleteVersionClick: onDeleteVersion,
    onLockClick: lockTemplate,
  };
}
