import { useCallback, useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/components/AppProvider';
import { getTemplateRefs } from '../../../domain/state/template/templates-state';
import { compareVersions } from '../../../domain/utils/version';
import type { TemplateReference } from '../../../model/schemas';
import { ThemeActionType } from '../actions/theme-action-type';

export function useThemeDetailsCardViewModel() {
  const dispatch = useAppDispatch();
  const { selectedRef, theme, generateResult } = useContextSelector(AppContext, (c) => {
    const slice = c?.state.themes;
    if (slice === undefined) {
      throw new Error('Theme state requires AppProvider.');
    }
    return slice;
  });
  const { templateMap } = useContextSelector(AppContext, (c) => {
    const slice = c?.state.templates;
    if (slice === undefined) {
      throw new Error('Template state requires AppProvider.');
    }
    return slice;
  });
  const templateRefs = useMemo(() => getTemplateRefs(templateMap), [templateMap]);

  const templateNamesList = useMemo(() => {
    const names = new Set(templateRefs.map((r) => r.name));
    return [...names].sort();
  }, [templateRefs]);

  const templateVersionsByName = useMemo(() => {
    const map: Record<string, TemplateReference[]> = {};
    for (const ref of templateRefs) {
      if (!map[ref.name]) map[ref.name] = [];
      map[ref.name].push(ref);
    }
    for (const name of Object.keys(map)) {
      map[name].sort((a, b) => compareVersions(b.version, a.version));
    }
    return map;
  }, [templateRefs]);

  const selectedTemplateName = theme?.templateRef?.name ?? null;
  const selectedTemplateVersion = theme?.templateRef?.version ?? null;

  const canGenerate = useMemo(() => {
    if (!theme || !theme.templateRef) return false;
    const allColorAssigned = theme.colorAssignments.every(
      (a) => a.dark !== null && (a.useDarkForLight || a.light !== null),
    );
    const allContrastAssigned = theme.contrastAssignments.every(
      (a) => a.dark !== null && (a.useDarkForLight || a.light !== null),
    );
    return allColorAssigned && allContrastAssigned;
  }, [theme]);

  const generateTheme = useCallback(() => {
    if (!canGenerate || !theme?.templateRef) {
      return;
    }
    dispatch({ type: ThemeActionType.ThemeDetailsGenerateButtonOnClick });
  }, [canGenerate, dispatch, theme]);

  const bumpVersion = useCallback(() => {
    dispatch({ type: ThemeActionType.ThemeDetailsIncrementVersionButtonOnClick });
  }, [dispatch]);

  const deleteVersion = useCallback(
    (name: string, version: string) => {
      dispatch({ type: ThemeActionType.ThemeDetailsDeleteVersionButtonOnClick, name, version });
    },
    [dispatch],
  );

  const changeTemplate = useCallback(
    (templateName: string, version?: string) => {
      const versions = templateVersionsByName[templateName];
      if (!versions || versions.length === 0) return;
      const selectedVersion = version ?? versions[0].version;
      dispatch({
        type: ThemeActionType.ThemeDetailsTemplateListOnCommit,
        name: templateName,
        version: selectedVersion,
      });
    },
    [dispatch, templateVersionsByName],
  );

  const changeTemplateVersion = useCallback(
    (version: string) => {
      if (!theme?.templateRef) return;
      dispatch({
        type: ThemeActionType.ThemeDetailsTemplateVersionListOnCommit,
        name: theme.templateRef.name,
        version,
      });
    },
    [dispatch, theme],
  );

  const onDeleteVersion = useCallback(() => {
    if (selectedRef) deleteVersion(selectedRef.name, selectedRef.version);
  }, [deleteVersion, selectedRef]);

  return {
    theme,
    templateNamesList,
    templateVersionsByName,
    selectedTemplateName,
    selectedTemplateVersion,
    generateResult,
    canGenerate,
    onDeleteVersion,
    onGenerate: generateTheme,
    onBumpVersion: bumpVersion,
    onChangeTemplate: changeTemplate,
    onChangeTemplateVersion: changeTemplateVersion,
  };
}
