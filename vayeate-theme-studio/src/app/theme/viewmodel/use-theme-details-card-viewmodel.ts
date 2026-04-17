import { useCallback, useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { getTemplateRefs } from '../../../domain/state/template/templates-state';
import { TemplatesStore } from '../../../domain/state/template/templates-store';
import { ThemesStore } from '../../../domain/state/theme/themes-store';
import { compareVersions } from '../../../domain/utils/compare-versions';
import type { ColorAssignment, ContrastAssignment, TemplateReference } from '../../../model/schema/theme-schemas';
import { ThemeActionType } from '../actions/theme-action-type';

const templatesStore = container.resolve(TemplatesStore);
const themesStore = container.resolve(ThemesStore);

export function useThemeDetailsCardViewModel() {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(themesStore.api, (state) => state.state.selectedRef);
  const theme = useStore(themesStore.api, (state) => state.state.theme);
  const generateResult = useStore(themesStore.api, (state) => state.state.generateResult);
  const templateMap = useStore(templatesStore.api, (state) => state.state.templateMap);
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
      (a: ColorAssignment) => a.dark !== null && (a.useDarkForLight || a.light !== null),
    );
    const allContrastAssigned = theme.contrastAssignments.every(
      (a: ContrastAssignment) => a.dark !== null && (a.useDarkForLight || a.light !== null),
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

