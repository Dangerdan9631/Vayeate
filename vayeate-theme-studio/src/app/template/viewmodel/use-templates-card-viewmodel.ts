import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { useTemplatesState } from '../context/use-templates-state';
import { getTemplateRefs } from '../../../domain/state/template/templates-state';
import { compareVersions } from '../../../domain/utils/version';
import type { TemplateReference } from '../../../model/schemas';
import { TemplateActionType } from '../actions/template-action-type';

export function useTemplatesCardViewModel() {
  const dispatch = useAppDispatch();
  const { selectedRef, isCreating, templateMap } = useTemplatesState();
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
    dispatch({ type: TemplateActionType.TemplateCreateDialogOnOpen });
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
