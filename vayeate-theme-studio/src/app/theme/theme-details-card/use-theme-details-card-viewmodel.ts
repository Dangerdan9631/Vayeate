import { useCallback, useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { getCurrentTemplateRefs, TemplatesStore } from '../../../domain/state/template/templates-store';
import { ThemesStore } from '../../../domain/state/theme/themes-store';
import { compareVersions } from '../../../domain/utils/compare-versions';
import type { ColorAssignment, ContrastAssignment, TemplateReference, Theme } from '../../../model/schema/theme-schemas';
import { ThemeDetailsCardActionType } from './actions/theme-details-card-action-type';

const templatesStore = container.resolve(TemplatesStore);
const themesStore = container.resolve(ThemesStore);

export interface ThemeDetailsCardViewModel {
  theme: Theme | null;
  templateNamesList: string[];
  versionsForSelectedTemplate: TemplateReference[];
  selectedTemplateName: string | null;
  selectedTemplateVersion: string | null;
  generateResult: { success: boolean; message: string } | null;
  canGenerate: boolean;
  generateButtonTitle: string;
  onDeleteVersionClick: () => void;
  onGenerateClick: () => void;
  onBumpVersionClick: () => void;
  onTemplateChange: (templateName: string) => void;
  onTemplateVersionChange: (version: string) => void;
}

export function useThemeDetailsCardViewModel(): ThemeDetailsCardViewModel {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(themesStore.api, (state) => state.state.selectedRef);
  const theme = useStore(themesStore.api, (state) => state.state.theme);
  const generateResult = useStore(themesStore.api, (state) => state.state.generateResult);
  const templateMap = useStore(templatesStore.api, (state) => state.state.templates);
  const templateRefs = useMemo(() => getCurrentTemplateRefs(templateMap), [templateMap]);

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

  const selectedTemplateName = useMemo(() => theme?.templateRef?.name ?? null, [theme]);
  const selectedTemplateVersion = useMemo(() => theme?.templateRef?.version ?? null, [theme]);
  const versionsForSelectedTemplate = useMemo(
    () => selectedTemplateName ? templateVersionsByName[selectedTemplateName] ?? [] : [],
    [selectedTemplateName, templateVersionsByName],
  );

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
  const generateButtonTitle = useMemo(
    () => canGenerate ? 'Generate theme' : 'All variables must have values assigned',
    [canGenerate],
  );

  const generateTheme = useCallback(() => {
    if (!canGenerate || !theme?.templateRef) {
      return;
    }
    void dispatch({ type: ThemeDetailsCardActionType.GenerateButtonOnClick });
  }, [canGenerate, dispatch, theme]);

  const bumpVersion = useCallback(() => {
    void dispatch({ type: ThemeDetailsCardActionType.IncrementVersionButtonOnClick });
  }, [dispatch]);

  const deleteVersion = useCallback(
    (name: string, version: string) => {
      void dispatch({ type: ThemeDetailsCardActionType.DeleteVersionButtonOnClick, name, version });
    },
    [dispatch],
  );

  const changeTemplate = useCallback(
    (templateName: string, version?: string) => {
      const versions = templateVersionsByName[templateName];
      if (!versions || versions.length === 0) return;
      const selectedVersion = version ?? versions[0].version;
      void dispatch({
        type: ThemeDetailsCardActionType.TemplateListOnCommit,
        name: templateName,
        version: selectedVersion,
      });
    },
    [dispatch, templateVersionsByName],
  );

  const changeTemplateVersion = useCallback(
    (version: string) => {
      if (!theme?.templateRef) return;
      void dispatch({
        type: ThemeDetailsCardActionType.TemplateVersionListOnCommit,
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
    versionsForSelectedTemplate,
    selectedTemplateName,
    selectedTemplateVersion,
    generateResult,
    canGenerate,
    generateButtonTitle,
    onDeleteVersionClick: onDeleteVersion,
    onGenerateClick: generateTheme,
    onBumpVersionClick: bumpVersion,
    onTemplateChange: changeTemplate,
    onTemplateVersionChange: changeTemplateVersion,
  };
}

