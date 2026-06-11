import { useCallback, useMemo } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { compareVersions } from '../../../domain/utils/compare-versions';
import { GroupsCardActionType } from './actions/groups-card-action-type';
import { container } from 'tsyringe';
import { getCurrentTemplate, getCurrentTemplateRefs, TemplatesStore } from '../../../domain/state/data/templates-store';
import { TemplateUiStore } from '../../../domain/state/ui/template-ui-store';
import type { Template } from '../../../model/schema/template-schemas';

const templatesStore = container.resolve(TemplatesStore);
const templateUiStore = container.resolve(TemplateUiStore);

/**
 * Presentation model for one group row in the groups card.
 */
export interface GroupRowViewModel {
  name: string;
  isInUse: boolean;
  removeButtonTitle: string;
}

/**
 * Read model and action callbacks for the template groups card.
 */
export interface GroupsCardViewModel {
  template: Template | null;
  groupRows: GroupRowViewModel[];
  canEdit: boolean;
  addGroupName: string;
  canAddGroup: boolean;
  onRemoveGroupClick: (name: string) => void;
  onAddGroupNameChange: (value: string) => void;
  onAddGroupClick: () => void;
}

/**
 * Subscribes to template groups and exposes add/remove callbacks.
 * @returns Groups card state and dispatch-backed handlers.
 */
export function useGroupsCardViewModel(): GroupsCardViewModel {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(templateUiStore.api, (state) => state.state.selectedRef);
  const templateMap = useStore(templatesStore.api, (state) => state.state.templates);
  const template = useMemo(() => getCurrentTemplate(templateMap, selectedRef), [templateMap, selectedRef]);
  const addGroupName = useStore(templateUiStore.api, (state) => state.state.addGroupName);

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

  const groups = useMemo(() => template?.groups ?? [], [template]);

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

  const groupRows = useMemo(() => {
    return [...groups]
      .sort((a, b) => a.localeCompare(b))
      .map((name) => {
        const isInUse = groupNamesInUse.has(name);
        return {
          name,
          isInUse,
          removeButtonTitle: isInUse ? 'Cannot remove: group has mappings or variables' : 'Remove group',
        };
      });
  }, [groupNamesInUse, groups]);

  const removeGroup = useCallback(
    (name: string) => {
      void dispatch({ type: GroupsCardActionType.GroupRemoveButtonOnClick, groupId: name });
    },
    [dispatch],
  );

  const onAddGroupNameChange = useCallback(
    (value: string) => {
      void dispatch({ type: GroupsCardActionType.GroupAddTextOnChange, value });
    },
    [dispatch],
  );

  const trimmed = addGroupName.trim();
  const canAddGroup = useMemo(() => trimmed.length > 0 && !groups.includes(trimmed), [groups, trimmed]);

  const onAddGroupClick = useCallback(() => {
    if (!canAddGroup) return;
    void dispatch({ type: GroupsCardActionType.GroupAddButtonOnClick });
  }, [canAddGroup, dispatch]);

  return {
    template,
    groupRows,
    canEdit,
    addGroupName,
    canAddGroup,
    onRemoveGroupClick: removeGroup,
    onAddGroupNameChange,
    onAddGroupClick,
  };
}
