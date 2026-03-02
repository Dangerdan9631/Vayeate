import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppState } from '../ui/context/useAppState';
import { compareVersions, nextPatchVersion } from '../utils/version';
import { createLogger } from '../utils/logger';
import { templateService } from '../services/template-service';
import type {
  ColorAssignment,
  ColorVariableKey,
  ContrastAssignment,
  ContrastAssignmentValue,
  ContrastComparisonMethod,
  ContrastVariable,
  Template,
  TemplateReference,
  Theme,
  ThemeReference,
} from '../model/schemas';

const log = createLogger('ThemeVM');

export function useThemeViewModel() {
  const { state, dispatch } = useAppState();
  const { themeRefs, selectedRef, theme, isCreating, createDialogOpen, generateResult, saveError } = state.themes;
  const { templateRefs } = state.templates;

  useEffect(() => {
    log.debug('initial mount → LOAD_THEME_REFS + LOAD_TEMPLATE_REFS');
    dispatch({ type: 'LOAD_THEME_REFS' });
    dispatch({ type: 'LOAD_TEMPLATE_REFS' });
  }, [dispatch]);

  const themeNames = useMemo(() => {
    const names = new Set(themeRefs.map((r) => r.name));
    return [...names].sort();
  }, [themeRefs]);

  const selectedName = selectedRef?.name ?? null;

  const versionsForSelectedName = useMemo(() => {
    if (!selectedName) return [];
    return themeRefs
      .filter((r) => r.name === selectedName)
      .sort((a, b) => compareVersions(b.version, a.version));
  }, [themeRefs, selectedName]);

  const highestVersionForName = useCallback(
    (name: string): ThemeReference | null => {
      const refs = themeRefs.filter((r) => r.name === name);
      if (refs.length === 0) return null;
      return refs.reduce((best, r) =>
        compareVersions(r.version, best.version) > 0 ? r : best,
      );
    },
    [themeRefs],
  );

  const isLatestVersion = useMemo(() => {
    if (!selectedRef || !selectedName) return false;
    const best = themeRefs
      .filter((r) => r.name === selectedName)
      .reduce<ThemeReference | null>(
        (acc, r) => (!acc || compareVersions(r.version, acc.version) > 0 ? r : acc),
        null,
      );
    return best !== null && best.version === selectedRef.version;
  }, [themeRefs, selectedRef, selectedName]);

  // --- Template list helpers ---

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

  // --- Loaded template for the theme ---

  const selectedTemplateName = theme?.templateRef?.name ?? null;
  const selectedTemplateVersion = theme?.templateRef?.version ?? null;

  const [loadedTemplate, setLoadedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (!selectedTemplateName || !selectedTemplateVersion) {
      setLoadedTemplate(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const t = await templateService.loadTemplate(selectedTemplateName, selectedTemplateVersion);
      if (!cancelled) setLoadedTemplate(t);
    })();
    return () => { cancelled = true; };
  }, [selectedTemplateName, selectedTemplateVersion]);

  const colorVariablesFromTemplate = useMemo(
    () => loadedTemplate?.colorVariables ?? [],
    [loadedTemplate],
  );

  const contrastVariablesFromTemplate: readonly ContrastVariable[] = useMemo(
    () => loadedTemplate?.contrastVariables ?? [],
    [loadedTemplate],
  );

  const groupsFromTemplate = useMemo(
    () => loadedTemplate?.groups ?? [],
    [loadedTemplate],
  );

  // --- Orphan detection ---

  const orphanColorKeys = useMemo(() => {
    return computeOrphanColorKeys(theme);
  }, [theme]);

  const orphanContrastKeys = useMemo(() => {
    return computeOrphanContrastKeys(theme);
  }, [theme]);

  // --- canGenerate ---

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

  // --- Helpers ---

  /** Use when saving in place (assignments, IDE preview ref). Does not bump version. */
  function getBaseInPlace(t: Theme): Theme {
    return { ...t };
  }

  /** Use only when template or template version changes. Bumps theme version. */
  function getBaseWithVersionBump(t: Theme): Theme {
    return { ...t, version: nextPatchVersion(t.version) };
  }

  // --- Actions ---

  const selectTheme = useCallback(
    (name: string, version: string) => {
      log.debug('selectTheme', name, `v${version}`);
      dispatch({ type: 'SELECT_THEME', name, version });
    },
    [dispatch],
  );

  const selectName = useCallback(
    (name: string) => {
      const best = highestVersionForName(name);
      if (best) {
        log.debug('selectName', name, '→ highest version', `v${best.version}`);
        dispatch({ type: 'SELECT_THEME', name: best.name, version: best.version });
      } else {
        log.warn('selectName', name, '→ no versions found');
      }
    },
    [dispatch, highestVersionForName],
  );

  const openCreateDialog = useCallback(() => {
    log.debug('openCreateDialog');
    dispatch({ type: 'OPEN_THEME_CREATE_DIALOG' });
  }, [dispatch]);

  const closeCreateDialog = useCallback(() => {
    log.debug('closeCreateDialog');
    dispatch({ type: 'CLOSE_THEME_CREATE_DIALOG' });
  }, [dispatch]);

  const createTheme = useCallback(
    (params: { name: string }) => {
      log.debug('createTheme', params.name);
      dispatch({ type: 'CREATE_THEME', params });
    },
    [dispatch],
  );

  const deleteVersion = useCallback(
    (name: string, version: string) => {
      log.debug('deleteVersion', name, `v${version}`);
      dispatch({ type: 'DELETE_THEME_VERSION', name, version });
    },
    [dispatch],
  );

  const generateTheme = useCallback(() => {
    if (!canGenerate || !theme?.templateRef) {
      log.warn('generateTheme skipped: not all variables assigned or no template');
      return;
    }
    log.debug('generateTheme', theme.name, theme.templateRef.name);
    dispatch({
      type: 'GENERATE_THEME',
      themeName: theme.name,
      themeVersion: theme.version,
      templateName: theme.templateRef.name,
      templateVersion: theme.templateRef.version,
    });
  }, [canGenerate, dispatch, theme]);

  const bumpVersion = useCallback(() => {
    if (!theme) return;
    log.debug('bumpVersion', theme.name, `v${theme.version} → v${nextPatchVersion(theme.version)}`);
    const bumped = getBaseWithVersionBump(theme);
    dispatch({ type: 'SAVE_THEME', theme: bumped });
  }, [dispatch, theme]);

  // --- Template selection ---

  const changeTemplate = useCallback(
    async (templateName: string) => {
      if (!theme) return;
      log.debug('changeTemplate', templateName);

      const versions = templateVersionsByName[templateName];
      if (!versions || versions.length === 0) return;
      const highestVersion = versions[0].version;

      const template = await templateService.loadTemplate(templateName, highestVersion);
      if (!template) return;

      const base = theme.templateRef ? getBaseWithVersionBump(theme) : getBaseInPlace(theme);
      const merged = mergeAssignmentsFromTemplate(base, template);
      dispatch({ type: 'SAVE_THEME', theme: merged });
    },
    [dispatch, theme, templateVersionsByName],
  );

  const changeTemplateVersion = useCallback(
    async (version: string) => {
      if (!theme || !theme.templateRef) return;
      log.debug('changeTemplateVersion', theme.templateRef.name, `v${version}`);

      const template = await templateService.loadTemplate(theme.templateRef.name, version);
      if (!template) return;

      const base = getBaseWithVersionBump(theme);
      const merged = mergeAssignmentsFromTemplate(base, template);
      dispatch({ type: 'SAVE_THEME', theme: merged });
    },
    [dispatch, theme],
  );

  // --- IDE primary color (no version bump) ---

  const changeIdePrimaryColorRef = useCallback(
    (ref: ColorVariableKey | null) => {
      if (!theme) return;
      log.debug('changeIdePrimaryColorRef', ref);
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SAVE_THEME', theme: { ...base, idePrimaryColorVariableRef: ref } });
    },
    [dispatch, theme],
  );

  // --- Theme background color (no version bump) ---

  const changeThemeBackgroundColorRef = useCallback(
    (ref: ColorVariableKey | null) => {
      if (!theme) return;
      log.debug('changeThemeBackgroundColorRef', ref);
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SAVE_THEME', theme: { ...base, themeBackgroundColorVariableRef: ref } });
    },
    [dispatch, theme],
  );

  // --- Color assignment updates (no version bump) ---

  const updateColorAssignmentDark = useCallback(
    (colorRef: string, value: string | null) => {
      if (!theme) return;
      log.debug('updateColorAssignmentDark', colorRef, value);
      const base = getBaseInPlace(theme);
      const newAssignments = base.colorAssignments.map((a) =>
        a.colorRef === colorRef
          ? { ...a, dark: value !== null ? { value } : null }
          : a,
      );
      dispatch({ type: 'SAVE_THEME', theme: { ...base, colorAssignments: newAssignments } });
    },
    [dispatch, theme],
  );

  const updateColorAssignmentLight = useCallback(
    (colorRef: string, value: string | null) => {
      if (!theme) return;
      log.debug('updateColorAssignmentLight', colorRef, value);
      const base = getBaseInPlace(theme);
      const newAssignments = base.colorAssignments.map((a) =>
        a.colorRef === colorRef
          ? { ...a, light: value !== null ? { value } : null }
          : a,
      );
      dispatch({ type: 'SAVE_THEME', theme: { ...base, colorAssignments: newAssignments } });
    },
    [dispatch, theme],
  );

  const updateColorAssignmentUseDarkForLight = useCallback(
    (colorRef: string, useDark: boolean) => {
      if (!theme) return;
      log.debug('updateColorAssignmentUseDarkForLight', colorRef, useDark);
      const base = getBaseInPlace(theme);
      const newAssignments = base.colorAssignments.map((a) =>
        a.colorRef === colorRef ? { ...a, useDarkForLight: useDark } : a,
      );
      dispatch({ type: 'SAVE_THEME', theme: { ...base, colorAssignments: newAssignments } });
    },
    [dispatch, theme],
  );

  // --- Contrast assignment updates (no version bump) ---

  const updateContrastAssignmentDark = useCallback(
    (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => {
      if (!theme) return;
      log.debug('updateContrastAssignmentDark', contrastRef, field, value);
      const base = getBaseInPlace(theme);
      const newAssignments = base.contrastAssignments.map((a) => {
        if (a.contrastVariableRef !== contrastRef) return a;
        const dark = a.dark ?? { value: 1, comparisonMethod: 'greaterThan' as const, min: null, max: null };
        return { ...a, dark: { ...dark, [field]: value } };
      });
      dispatch({ type: 'SAVE_THEME', theme: { ...base, contrastAssignments: newAssignments } });
    },
    [dispatch, theme],
  );

  const updateContrastAssignmentLight = useCallback(
    (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => {
      if (!theme) return;
      log.debug('updateContrastAssignmentLight', contrastRef, field, value);
      const base = getBaseInPlace(theme);
      const newAssignments = base.contrastAssignments.map((a) => {
        if (a.contrastVariableRef !== contrastRef) return a;
        const light = a.light ?? { value: 1, comparisonMethod: 'greaterThan' as const, min: null, max: null };
        return { ...a, light: { ...light, [field]: value } };
      });
      dispatch({ type: 'SAVE_THEME', theme: { ...base, contrastAssignments: newAssignments } });
    },
    [dispatch, theme],
  );

  const updateContrastAssignmentUseDarkForLight = useCallback(
    (contrastRef: string, useDark: boolean) => {
      if (!theme) return;
      log.debug('updateContrastAssignmentUseDarkForLight', contrastRef, useDark);
      const base = getBaseInPlace(theme);
      const newAssignments = base.contrastAssignments.map((a) =>
        a.contrastVariableRef === contrastRef ? { ...a, useDarkForLight: useDark } : a,
      );
      dispatch({ type: 'SAVE_THEME', theme: { ...base, contrastAssignments: newAssignments } });
    },
    [dispatch, theme],
  );

  // --- Color variable keys from assignments (for the IDE primary color dropdown) ---

  const colorVariableKeys = useMemo(() => {
    if (!theme) return [];
    return theme.colorAssignments.map((a) => a.colorRef);
  }, [theme]);

  const templateMappings = useMemo(
    () => loadedTemplate?.mappings ?? [],
    [loadedTemplate],
  );

  return {
    themeRefs,
    selectedRef,
    theme,
    isCreating,
    createDialogOpen,
    themeNames,
    selectedName,
    versionsForSelectedName,
    isLatestVersion,
    templateNamesList,
    templateVersionsByName,
    selectedTemplateName,
    selectedTemplateVersion,
    colorVariablesFromTemplate,
    contrastVariablesFromTemplate,
    groupsFromTemplate,
    orphanColorKeys,
    orphanContrastKeys,
    canGenerate,
    generateResult,
    colorVariableKeys,
    templateMappings,
    selectTheme,
    selectName,
    openCreateDialog,
    closeCreateDialog,
    createTheme,
    deleteVersion,
    generateTheme,
    bumpVersion,
    changeTemplate,
    changeTemplateVersion,
    changeIdePrimaryColorRef,
    changeThemeBackgroundColorRef,
    updateColorAssignmentDark,
    updateColorAssignmentLight,
    updateColorAssignmentUseDarkForLight,
    updateContrastAssignmentDark,
    updateContrastAssignmentLight,
    updateContrastAssignmentUseDarkForLight,
    saveError,
    dismissSaveError: useCallback(() => {
      dispatch({ type: 'DISMISS_THEME_SAVE_ERROR' });
    }, [dispatch]),
  };
}

export function mergeAssignmentsFromTemplate(theme: Theme, template: Template): Theme {
  const templateRef = { name: template.name, version: template.version };

  const existingColorMap = new Map<string, ColorAssignment>();
  for (const a of theme.colorAssignments) {
    existingColorMap.set(a.colorRef, a);
  }

  const newColorAssignments: ColorAssignment[] = template.colorVariables.map((v) => {
    const existing = existingColorMap.get(v.key);
    if (existing) return existing;
    return { colorRef: v.key, light: null, dark: null, useDarkForLight: false };
  });

  const existingContrastMap = new Map<string, ContrastAssignment>();
  for (const a of theme.contrastAssignments) {
    existingContrastMap.set(a.contrastVariableRef, a);
  }

  const newContrastAssignments: ContrastAssignment[] = template.contrastVariables.map((v) => {
    const existing = existingContrastMap.get(v.key);
    if (existing) return existing;
    return { contrastVariableRef: v.key, light: null, dark: null, useDarkForLight: false };
  });

  const idePrimaryColorVariableRef = theme.idePrimaryColorVariableRef &&
    newColorAssignments.some((a) => a.colorRef === theme.idePrimaryColorVariableRef)
    ? theme.idePrimaryColorVariableRef
    : null;

  const themeBackgroundColorVariableRef = theme.themeBackgroundColorVariableRef &&
    newColorAssignments.some((a) => a.colorRef === theme.themeBackgroundColorVariableRef)
    ? theme.themeBackgroundColorVariableRef
    : null;

  return {
    ...theme,
    templateRef,
    idePrimaryColorVariableRef,
    themeBackgroundColorVariableRef,
    colorAssignments: newColorAssignments,
    contrastAssignments: newContrastAssignments,
  };
}

export function computeOrphanColorKeys(theme: Theme | null): Set<string> {
  if (!theme || !theme.templateRef) return new Set();
  return new Set<string>();
}

export function computeOrphanContrastKeys(theme: Theme | null): Set<string> {
  if (!theme || !theme.templateRef) return new Set();
  return new Set<string>();
}
