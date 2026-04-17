import { useCallback, useMemo } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { getTemplateRefs } from '../../../domain/state/template/templates-state';
import { compareVersions } from '../../../domain/utils/compare-versions';
import type { TemplateReference } from '../../../model/schema/theme-schemas';
import { TemplateActionType } from '../actions/template-action-type';
import { container } from 'tsyringe';
import { TemplatesStore } from '../../../domain/state/template/templates-store';

const templatesStore = container.resolve(TemplatesStore);

export function useTemplatesCardViewModel() {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(templatesStore.api, (state) => state.state.selectedRef);
  const isCreating = useStore(templatesStore.api, (state) => state.state.isCreating);
  const templateMap = useStore(templatesStore.api, (state) => state.state.templateMap);
  const templateRefs = useMemo(() => getTemplateRefs(templateMap), [templateMap]);

  const templateNames = useMemo(() => {
    const names = new Set(templateRefs.map((r) => r.name));
    return [...names].sort();
  }, [templateRefs]);

  const selectedName = selectedRef?.name ?? null;

  const versionsForSelectedName = useMemo(() => {
    if (!selectedName) return [];
    return templateRefs
      .filter((r) => r.name === selectedName)
      .sort((a, b) => compareVersions(b.version, a.version));
  }, [templateRefs, selectedName]);

  const highestVersionForName = useCallback(
    (name: string): TemplateReference | null => {
      const refs = templateRefs.filter((r) => r.name === name);
      if (refs.length === 0) return null;
      return refs.reduce((best, r) => (compareVersions(r.version, best.version) > 0 ? r : best));
    },
    [templateRefs],
  );

  const selectTemplate = useCallback(
    (name: string, version: string) => {
      dispatch({ type: TemplateActionType.TemplateTemplatesListOnCommit, name, version });
    },
    [dispatch],
  );

  const selectName = useCallback(
    (name: string) => {
      const best = highestVersionForName(name);
      if (best) {
        dispatch({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: best.name, version: best.version });
      }
    },
    [dispatch, highestVersionForName],
  );

  const openCreateDialog = useCallback(() => {
    dispatch({ type: TemplateActionType.TemplateTemplatesCreateButtonOnClick });
  }, [dispatch]);

  const onSelectVersion = useCallback(
    (version: string) => {
      if (selectedName) selectTemplate(selectedName, version);
    },
    [selectTemplate, selectedName],
  );

  return {
    templateNames,
    selectedName,
    versionsForSelectedName,
    selectedRef,
    onSelectName: selectName,
    onSelectVersion,
    onCreateClick: openCreateDialog,
    isCreating,
  };
}
