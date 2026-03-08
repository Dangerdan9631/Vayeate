import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useThemesState, useTemplatesState } from '../ui/context/slice-contexts';
import { useUndoStack } from '../ui/context/UndoContext';
import type { ThemePaneState } from '../ui/context/UndoContext';
import { compareVersions, nextPatchVersion } from '../utils/version';
import { createLogger } from '../utils/logger';
import { templateService } from '../services/template-service';
import { applyHueShift } from '../core/color';
import type {
  ColorAssignment,
  ContrastAssignment,
  ContrastAssignmentValue,
  ContrastComparisonMethod,
  ContrastVariable,
  Template,
  TemplateReference,
  Theme,
  ThemeReference,
  TokenKey,
} from '../model/schemas';

const log = createLogger('ThemeVM');

const UNGROUPED_KEY = '__ungrouped__';

export type SelectedColorsDisplay =
  | { kind: 'none' }
  | { kind: 'single'; hex: string }
  | { kind: 'mixed' };

function normalizeHex(hex: string): string {
  const s = (hex ?? '').trim().toLowerCase();
  return s.startsWith('#') ? s : s ? `#${s}` : '';
}

function applyHueToAssignmentsFiltered(
  assignments: readonly ColorAssignment[],
  shift: number,
  checkedRefs: ReadonlySet<string>,
  options: { applyToDark: boolean; applyToLight: boolean },
): ColorAssignment[] {
  const { applyToDark, applyToLight } = options;
  return assignments.map((a) => {
    if (!checkedRefs.has(a.colorRef)) return a;
    return {
      ...a,
      dark:
        applyToDark && a.dark
          ? { value: applyHueShift(a.dark.value, shift) }
          : a.dark,
      light:
        applyToLight && !a.useDarkForLight && a.light
          ? { value: applyHueShift(a.light.value, shift) }
          : a.light,
    };
  });
}

function themePaneStateFromState(
  theme: Theme | null,
  checkedColorRefs: string[],
  checkedContrastRefs: string[],
  hueAdjustment: number,
): ThemePaneState {
  return { theme, checkedColorRefs, checkedContrastRefs, hueAdjustment };
}

export function useThemeViewModel() {
  const dispatch = useAppDispatch();
  const undoStack = useUndoStack();
  const {
    themeRefs,
    selectedRef,
    theme,
    checkedColorRefs: checkedColorRefsArray,
    checkedContrastRefs: checkedContrastRefsArray,
    hueAdjustment,
    isCreating,
    createDialogOpen,
    generateResult,
    saveError,
  } = useThemesState();
  const { templateRefs } = useTemplatesState();

  const checkedColorRefs = useMemo(() => new Set(checkedColorRefsArray), [checkedColorRefsArray]);
  const checkedContrastRefs = useMemo(() => new Set(checkedContrastRefsArray), [checkedContrastRefsArray]);

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
  const [applyHueToDark, setApplyHueToDark] = useState(true);
  const [applyHueToLight, setApplyHueToLight] = useState(true);
  const hueDragStartRef = useRef<{ theme: Theme; hueAdjustment: number } | null>(null);

  const displayColorAssignments = useMemo(() => {
    if (!theme) return [];
    if (hueAdjustment === 0) return theme.colorAssignments;
    return applyHueToAssignmentsFiltered(
      theme.colorAssignments,
      hueAdjustment / 100,
      checkedColorRefs,
      { applyToDark: applyHueToDark, applyToLight: applyHueToLight },
    );
  }, [theme, hueAdjustment, checkedColorRefs, applyHueToDark, applyHueToLight]);

  const selectedColorsDisplay = useMemo((): SelectedColorsDisplay => {
    if (!theme || checkedColorRefs.size === 0) return { kind: 'none' };
    const assignments = displayColorAssignments;
    const effectiveHexes: string[] = [];
    for (const a of assignments) {
      if (!checkedColorRefs.has(a.colorRef)) continue;
      if (applyHueToDark) {
        const v = a.dark?.value;
        effectiveHexes.push(normalizeHex(v ?? ''));
      }
      if (applyHueToLight) {
        const v = a.useDarkForLight ? a.dark?.value : a.light?.value;
        effectiveHexes.push(normalizeHex(v ?? ''));
      }
    }
    if (effectiveHexes.length === 0) return { kind: 'none' };
    const first = effectiveHexes[0];
    const allSame = effectiveHexes.every((h) => h === first);
    return allSame ? { kind: 'single', hex: first || '#808080' } : { kind: 'mixed' };
  }, [theme, checkedColorRefs, displayColorAssignments, applyHueToDark, applyHueToLight]);

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

  // Sync theme assignments when template has variables the theme has no assignment for (no version bump).
  useEffect(() => {
    if (!theme || !loadedTemplate) return;
    if (theme.templateRef?.name !== loadedTemplate.name || theme.templateRef?.version !== loadedTemplate.version) return;

    const colorRefs = new Set(theme.colorAssignments.map((a) => a.colorRef));
    const contrastRefs = new Set(theme.contrastAssignments.map((a) => a.contrastVariableRef));
    const missingColor = loadedTemplate.colorVariables.some((v) => !colorRefs.has(v.key));
    const missingContrast = loadedTemplate.contrastVariables.some((v) => !contrastRefs.has(v.key));
    if (!missingColor && !missingContrast) return;

    const base = getBaseInPlace(theme);
    const merged = mergeAssignmentsFromTemplate(base, loadedTemplate);
    dispatch({ type: 'SAVE_THEME', theme: merged });
  }, [theme, loadedTemplate, dispatch]);

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

  /** Push theme-pane undo frame and dispatch SAVE_THEME (for user-initiated theme changes). */
  const pushThemeUndoAndSave = useCallback(
    (label: string, nextTheme: Theme, nextHueAdjustment: number = hueAdjustment) => {
      const prev = themePaneStateFromState(theme, checkedColorRefsArray, checkedContrastRefsArray, hueAdjustment);
      const next = themePaneStateFromState(nextTheme, checkedColorRefsArray, checkedContrastRefsArray, nextHueAdjustment);
      undoStack.push('themes', label, prev, next);
      dispatch({ type: 'SAVE_THEME', theme: nextTheme });
    },
    [theme, hueAdjustment, checkedColorRefsArray, checkedContrastRefsArray, undoStack, dispatch],
  );

  /** Push theme-pane undo frame and dispatch THEME_PANE_SELECTIONS_CHANGED (for selection changes). */
  const pushSelectionUndoAndDispatch = useCallback(
    (label: string, nextColorRefs: string[], nextContrastRefs: string[]) => {
      const prev = themePaneStateFromState(theme, checkedColorRefsArray, checkedContrastRefsArray, hueAdjustment);
      const next = themePaneStateFromState(theme, nextColorRefs, nextContrastRefs, hueAdjustment);
      undoStack.push('themes', label, prev, next);
      dispatch({ type: 'THEME_PANE_SELECTIONS_CHANGED', checkedColorRefs: nextColorRefs, checkedContrastRefs: nextContrastRefs });
    },
    [theme, hueAdjustment, checkedColorRefsArray, checkedContrastRefsArray, undoStack, dispatch],
  );

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
    dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
    pushThemeUndoAndSave('Bump version', bumped, 0);
  }, [theme, pushThemeUndoAndSave, dispatch]);

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
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Change template', merged, 0);
    },
    [theme, templateVersionsByName, pushThemeUndoAndSave, dispatch],
  );

  const changeTemplateVersion = useCallback(
    async (version: string) => {
      if (!theme || !theme.templateRef) return;
      log.debug('changeTemplateVersion', theme.templateRef.name, `v${version}`);

      const template = await templateService.loadTemplate(theme.templateRef.name, version);
      if (!template) return;

      const base = getBaseWithVersionBump(theme);
      const merged = mergeAssignmentsFromTemplate(base, template);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Change template version', merged, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );

  // --- Preview token refs (no version bump) ---

  const changeIdePrimaryTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      log.debug('changeIdePrimaryTokenRef', tokenKey);
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('IDE primary token', { ...base, idePrimaryTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );
  const changeIdeForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      log.debug('changeIdeForegroundTokenRef', tokenKey);
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('IDE foreground token', { ...base, ideForegroundTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );
  const changeThemeBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      log.debug('changeThemeBackgroundTokenRef', tokenKey);
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Theme background token', { ...base, themeBackgroundTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );
  const changeThemeForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      log.debug('changeThemeForegroundTokenRef', tokenKey);
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Theme foreground token', { ...base, themeForegroundTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );
  const changeLineNumberBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Line number background token', { ...base, lineNumberBackgroundTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );
  const changeLineNumberForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Line number foreground token', { ...base, lineNumberForegroundTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );
  const changeIdeTabTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('IDE tab token', { ...base, ideTabTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );
  const changeIdeTabBarBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('IDE tab bar background token', { ...base, ideTabBarBackgroundTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );
  const changeIdeTabBarForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('IDE tab bar foreground token', { ...base, ideTabBarForegroundTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );
  const changeEditorPreviewScrollbarBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Editor preview scrollbar background token', { ...base, editorPreviewScrollbarBackgroundTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );
  const changeEditorPreviewScrollbarForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Editor preview scrollbar foreground token', { ...base, editorPreviewScrollbarForegroundTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );
  const changeEditorPreviewSelectionBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Editor preview selection background token', { ...base, editorPreviewSelectionBackgroundTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );
  const changeEditorPreviewMenuForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Editor preview menu foreground token', { ...base, editorPreviewMenuForegroundTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );
  const changeEditorPreviewMenuBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Editor preview menu background token', { ...base, editorPreviewMenuBackgroundTokenRef: tokenKey }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );

  const setHueAdjustment = useCallback(
    (value: number) => {
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value });
    },
    [dispatch],
  );

  const startHueDrag = useCallback(() => {
    if (!theme) return;
    hueDragStartRef.current = { theme: getBaseInPlace(theme), hueAdjustment };
  }, [theme, hueAdjustment]);

  const endHueDrag = useCallback(() => {
    hueDragStartRef.current = null;
  }, []);

  const recenterHue = useCallback(() => {
    if (!theme) return;
    if (hueAdjustment === 0) {
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      return;
    }
    const newAssignments = applyHueToAssignmentsFiltered(
      theme.colorAssignments,
      hueAdjustment / 100,
      checkedColorRefs,
      { applyToDark: applyHueToDark, applyToLight: applyHueToLight },
    );
    const nextTheme = { ...getBaseInPlace(theme), colorAssignments: newAssignments };
    pushThemeUndoAndSave('Recenter hue', nextTheme, 0);
    dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
  }, [
    theme,
    hueAdjustment,
    checkedColorRefs,
    applyHueToDark,
    applyHueToLight,
    pushThemeUndoAndSave,
    dispatch,
  ]);

  // --- Color assignment updates (no version bump) ---

  const updateColorAssignmentDark = useCallback(
    (colorRef: string, value: string | null) => {
      if (!theme) return;
      log.debug('updateColorAssignmentDark', colorRef, value);
      const base = getBaseInPlace(theme);
      let workingAssignments = base.colorAssignments;
      if (hueAdjustment !== 0) {
        workingAssignments = applyHueToAssignmentsFiltered(
          theme.colorAssignments,
          hueAdjustment / 100,
          checkedColorRefs,
          { applyToDark: applyHueToDark, applyToLight: applyHueToLight },
        );
      }
      const newAssignments = workingAssignments.map((a) =>
        a.colorRef === colorRef
          ? { ...a, dark: value !== null ? { value } : null }
          : a,
      );
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Color variable', { ...base, colorAssignments: newAssignments }, 0);
    },
    [theme, hueAdjustment, checkedColorRefs, applyHueToDark, applyHueToLight, pushThemeUndoAndSave, dispatch],
  );

  const updateColorAssignmentLight = useCallback(
    (colorRef: string, value: string | null) => {
      if (!theme) return;
      log.debug('updateColorAssignmentLight', colorRef, value);
      const base = getBaseInPlace(theme);
      let workingAssignments = base.colorAssignments;
      if (hueAdjustment !== 0) {
        workingAssignments = applyHueToAssignmentsFiltered(
          theme.colorAssignments,
          hueAdjustment / 100,
          checkedColorRefs,
          { applyToDark: applyHueToDark, applyToLight: applyHueToLight },
        );
      }
      const newAssignments = workingAssignments.map((a) =>
        a.colorRef === colorRef
          ? { ...a, light: value !== null ? { value } : null }
          : a,
      );
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Color variable', { ...base, colorAssignments: newAssignments }, 0);
    },
    [theme, hueAdjustment, checkedColorRefs, applyHueToDark, applyHueToLight, pushThemeUndoAndSave, dispatch],
  );

  const updateColorAssignmentUseDarkForLight = useCallback(
    (colorRef: string, useDark: boolean) => {
      if (!theme) return;
      log.debug('updateColorAssignmentUseDarkForLight', colorRef, useDark);
      const base = getBaseInPlace(theme);
      let workingAssignments = base.colorAssignments;
      if (hueAdjustment !== 0) {
        workingAssignments = applyHueToAssignmentsFiltered(
          theme.colorAssignments,
          hueAdjustment / 100,
          checkedColorRefs,
          { applyToDark: applyHueToDark, applyToLight: applyHueToLight },
        );
      }
      const newAssignments = workingAssignments.map((a) =>
        a.colorRef === colorRef ? { ...a, useDarkForLight: useDark } : a,
      );
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Color variable', { ...base, colorAssignments: newAssignments }, 0);
    },
    [theme, hueAdjustment, checkedColorRefs, applyHueToDark, applyHueToLight, pushThemeUndoAndSave, dispatch],
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
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Contrast variable', { ...base, contrastAssignments: newAssignments }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
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
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Contrast variable', { ...base, contrastAssignments: newAssignments }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );

  const updateContrastAssignmentUseDarkForLight = useCallback(
    (contrastRef: string, useDark: boolean) => {
      if (!theme) return;
      log.debug('updateContrastAssignmentUseDarkForLight', contrastRef, useDark);
      const base = getBaseInPlace(theme);
      const newAssignments = base.contrastAssignments.map((a) =>
        a.contrastVariableRef === contrastRef ? { ...a, useDarkForLight: useDark } : a,
      );
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Contrast variable', { ...base, contrastAssignments: newAssignments }, 0);
    },
    [theme, pushThemeUndoAndSave, dispatch],
  );

  const toggleColorChecked = useCallback(
    (ref: string) => {
      const next = new Set(checkedColorRefsArray);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      pushSelectionUndoAndDispatch('Select variables', [...next], checkedContrastRefsArray);
    },
    [checkedColorRefsArray, checkedContrastRefsArray, pushSelectionUndoAndDispatch],
  );

  const toggleContrastChecked = useCallback(
    (ref: string) => {
      const next = new Set(checkedContrastRefsArray);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      pushSelectionUndoAndDispatch('Select variables', checkedColorRefsArray, [...next]);
    },
    [checkedColorRefsArray, checkedContrastRefsArray, pushSelectionUndoAndDispatch],
  );

  const setAllColorChecked = useCallback(
    (checked: boolean) => {
      if (!theme) return;
      const nextColor = checked ? theme.colorAssignments.map((a) => a.colorRef) : [];
      pushSelectionUndoAndDispatch(checked ? 'Select all variables' : 'Clear selection', nextColor, checkedContrastRefsArray);
    },
    [theme, checkedContrastRefsArray, pushSelectionUndoAndDispatch],
  );

  const setAllContrastChecked = useCallback(
    (checked: boolean) => {
      if (!theme) return;
      const nextContrast = checked ? theme.contrastAssignments.map((a) => a.contrastVariableRef) : [];
      pushSelectionUndoAndDispatch(checked ? 'Select all variables' : 'Clear selection', checkedColorRefsArray, nextContrast);
    },
    [theme, checkedColorRefsArray, pushSelectionUndoAndDispatch],
  );

  const setAllVariablesChecked = useCallback(
    (checked: boolean) => {
      if (!theme) return;
      const nextColor = checked ? theme.colorAssignments.map((a) => a.colorRef) : [];
      const nextContrast = checked ? theme.contrastAssignments.map((a) => a.contrastVariableRef) : [];
      pushSelectionUndoAndDispatch(checked ? 'Select all variables' : 'Clear selection', nextColor, nextContrast);
    },
    [theme, pushSelectionUndoAndDispatch],
  );

  const setColorGroupChecked = useCallback(
    (groupKey: string, checked: boolean) => {
      if (!theme) return;
      const varMap = new Map(colorVariablesFromTemplate.map((v) => [v.key, v]));
      const refsInGroup = theme.colorAssignments
        .filter((a) => {
          const v = varMap.get(a.colorRef);
          const g = v?.groupRef ?? null;
          const k = g === null ? UNGROUPED_KEY : g;
          return k === groupKey;
        })
        .map((a) => a.colorRef);
      const next = new Set(checkedColorRefsArray);
      refsInGroup.forEach((r) => (checked ? next.add(r) : next.delete(r)));
      pushSelectionUndoAndDispatch('Select variables', [...next], checkedContrastRefsArray);
    },
    [theme, colorVariablesFromTemplate, checkedColorRefsArray, checkedContrastRefsArray, pushSelectionUndoAndDispatch],
  );

  const setContrastGroupChecked = useCallback(
    (groupKey: string, checked: boolean) => {
      if (!theme) return;
      const varMap = new Map(contrastVariablesFromTemplate.map((v) => [v.key, v]));
      const refsInGroup = theme.contrastAssignments
        .filter((a) => {
          const v = varMap.get(a.contrastVariableRef);
          const g = v?.groupRef ?? null;
          const k = g === null ? UNGROUPED_KEY : g;
          return k === groupKey;
        })
        .map((a) => a.contrastVariableRef);
      const next = new Set(checkedContrastRefsArray);
      refsInGroup.forEach((r) => (checked ? next.add(r) : next.delete(r)));
      pushSelectionUndoAndDispatch('Select variables', checkedColorRefsArray, [...next]);
    },
    [theme, contrastVariablesFromTemplate, checkedColorRefsArray, checkedContrastRefsArray, pushSelectionUndoAndDispatch],
  );

  const setColorRefsChecked = useCallback(
    (refs: string[], checked: boolean) => {
      if (!theme || refs.length === 0) return;
      const next = new Set(checkedColorRefsArray);
      refs.forEach((r) => (checked ? next.add(r) : next.delete(r)));
      pushSelectionUndoAndDispatch('Select variables', [...next], checkedContrastRefsArray);
    },
    [theme, checkedColorRefsArray, checkedContrastRefsArray, pushSelectionUndoAndDispatch],
  );

  /** Returns current theme-pane state snapshot for color-picker undo (revert all changes when picker closes). */
  const openColorPicker = useCallback((): ThemePaneState => {
    return themePaneStateFromState(theme, checkedColorRefsArray, checkedContrastRefsArray, hueAdjustment);
  }, [theme, checkedColorRefsArray, checkedContrastRefsArray, hueAdjustment]);

  /** Applies hex to selected variables and saves; does not push undo. Use while color picker is open. */
  const setSelectedColorsPreview = useCallback(
    (hex: string) => {
      if (!theme || checkedColorRefs.size === 0) return;
      const normalized = normalizeHex(hex);
      if (!normalized) return;
      let workingAssignments = theme.colorAssignments;
      if (hueAdjustment !== 0) {
        workingAssignments = applyHueToAssignmentsFiltered(
          theme.colorAssignments,
          hueAdjustment / 100,
          checkedColorRefs,
          { applyToDark: applyHueToDark, applyToLight: applyHueToLight },
        );
        dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      }
      const newAssignments = workingAssignments.map((a) => {
        if (!checkedColorRefs.has(a.colorRef)) return a;
        let next = { ...a };
        if (applyHueToDark) {
          next = { ...next, dark: { value: normalized } };
        }
        if (applyHueToLight) {
          next = { ...next, light: { value: normalized } };
        }
        return next;
      });
      const base = getBaseInPlace(theme);
      const nextTheme = { ...base, colorAssignments: newAssignments };
      dispatch({ type: 'SAVE_THEME', theme: nextTheme });
    },
    [theme, hueAdjustment, checkedColorRefs, applyHueToDark, applyHueToLight, dispatch],
  );

  /** Pushes one undo entry (snapshot → current) and ensures save. Call when color picker closes. */
  const closeColorPicker = useCallback(
    (snapshot: ThemePaneState) => {
      const current = themePaneStateFromState(theme, checkedColorRefsArray, checkedContrastRefsArray, hueAdjustment);
      undoStack.push('themes', 'Palette color change', snapshot, current);
      if (theme) dispatch({ type: 'SAVE_THEME', theme });
    },
    [theme, hueAdjustment, checkedColorRefsArray, checkedContrastRefsArray, undoStack, dispatch],
  );

  const setSelectedColorsToHex = useCallback(
    (hex: string) => {
      if (!theme || checkedColorRefs.size === 0) return;
      const normalized = normalizeHex(hex);
      if (!normalized) return;
      let workingAssignments = theme.colorAssignments;
      if (hueAdjustment !== 0) {
        workingAssignments = applyHueToAssignmentsFiltered(
          theme.colorAssignments,
          hueAdjustment / 100,
          checkedColorRefs,
          { applyToDark: applyHueToDark, applyToLight: applyHueToLight },
        );
      }
      const newAssignments = workingAssignments.map((a) => {
        if (!checkedColorRefs.has(a.colorRef)) return a;
        let next = { ...a };
        if (applyHueToDark) {
          next = { ...next, dark: { value: normalized } };
        }
        if (applyHueToLight) {
          next = { ...next, light: { value: normalized } };
        }
        return next;
      });
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
      pushThemeUndoAndSave('Palette color change', { ...base, colorAssignments: newAssignments }, 0);
    },
    [theme, hueAdjustment, checkedColorRefs, applyHueToDark, applyHueToLight, pushThemeUndoAndSave, dispatch],
  );

  const colorSectionState = useMemo(() => {
    if (!theme?.colorAssignments.length) return 'all' as const;
    const refs = theme.colorAssignments.map((a) => a.colorRef);
    const all = refs.every((r) => checkedColorRefs.has(r));
    const none = refs.every((r) => !checkedColorRefs.has(r));
    if (all) return 'all' as const;
    if (none) return 'none' as const;
    return 'some' as const;
  }, [theme, checkedColorRefs]);

  const contrastSectionState = useMemo(() => {
    if (!theme?.contrastAssignments.length) return 'all' as const;
    const refs = theme.contrastAssignments.map((a) => a.contrastVariableRef);
    const all = refs.every((r) => checkedContrastRefs.has(r));
    const none = refs.every((r) => !checkedContrastRefs.has(r));
    if (all) return 'all' as const;
    if (none) return 'none' as const;
    return 'some' as const;
  }, [theme, checkedContrastRefs]);

  const cardState = useMemo(() => {
    const colorAll = colorSectionState === 'all';
    const colorNone = colorSectionState === 'none';
    const contrastAll = contrastSectionState === 'all';
    const contrastNone = contrastSectionState === 'none';
    if (colorAll && contrastAll) return 'all' as const;
    if (colorNone && contrastNone) return 'none' as const;
    return 'some' as const;
  }, [colorSectionState, contrastSectionState]);

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
    hueAdjustment,
    setHueAdjustment,
    startHueDrag,
    endHueDrag,
    recenterHue,
    applyHueToDark,
    applyHueToLight,
    setApplyHueToDark,
    setApplyHueToLight,
    displayColorAssignments,
    selectedColorsDisplay,
    openColorPicker,
    setSelectedColorsPreview,
    closeColorPicker,
    setSelectedColorsToHex,
    checkedColorRefs,
    checkedContrastRefs,
    toggleColorChecked,
    toggleContrastChecked,
    setAllColorChecked,
    setAllContrastChecked,
    setAllVariablesChecked,
    setColorGroupChecked,
    setContrastGroupChecked,
    setColorRefsChecked,
    colorSectionState,
    contrastSectionState,
    cardState,
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
    changeIdePrimaryTokenRef,
    changeIdeForegroundTokenRef,
    changeThemeBackgroundTokenRef,
    changeThemeForegroundTokenRef,
    changeLineNumberBackgroundTokenRef,
    changeLineNumberForegroundTokenRef,
    changeIdeTabTokenRef,
    changeIdeTabBarBackgroundTokenRef,
    changeIdeTabBarForegroundTokenRef,
    changeEditorPreviewScrollbarBackgroundTokenRef,
    changeEditorPreviewScrollbarForegroundTokenRef,
    changeEditorPreviewSelectionBackgroundTokenRef,
    changeEditorPreviewMenuForegroundTokenRef,
    changeEditorPreviewMenuBackgroundTokenRef,
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

  const themeTokenKeys = [...new Set(
    template.mappings
      .filter((m) => m.token.type === 'theme' && m.colorVariableRef != null)
      .map((m) => m.token.key),
  )].sort();
  const validTokenRef = (tokenRef: string | null | undefined) =>
    tokenRef != null && themeTokenKeys.includes(tokenRef) ? tokenRef : null;

  const idePrimaryTokenRef = validTokenRef(theme.idePrimaryTokenRef);
  const ideForegroundTokenRef = validTokenRef(theme.ideForegroundTokenRef);
  const themeBackgroundTokenRef = validTokenRef(theme.themeBackgroundTokenRef);
  const themeForegroundTokenRef = validTokenRef(theme.themeForegroundTokenRef);
  const lineNumberBackgroundTokenRef = validTokenRef(theme.lineNumberBackgroundTokenRef);
  const lineNumberForegroundTokenRef = validTokenRef(theme.lineNumberForegroundTokenRef);
  const ideTabTokenRef = validTokenRef(theme.ideTabTokenRef);
  const ideTabBarBackgroundTokenRef = validTokenRef(theme.ideTabBarBackgroundTokenRef);
  const ideTabBarForegroundTokenRef = validTokenRef(theme.ideTabBarForegroundTokenRef);
  const editorPreviewScrollbarBackgroundTokenRef = validTokenRef(theme.editorPreviewScrollbarBackgroundTokenRef);
  const editorPreviewScrollbarForegroundTokenRef = validTokenRef(theme.editorPreviewScrollbarForegroundTokenRef);
  const editorPreviewSelectionBackgroundTokenRef = validTokenRef(theme.editorPreviewSelectionBackgroundTokenRef);
  const editorPreviewMenuForegroundTokenRef = validTokenRef(theme.editorPreviewMenuForegroundTokenRef);
  const editorPreviewMenuBackgroundTokenRef = validTokenRef(theme.editorPreviewMenuBackgroundTokenRef);

  return {
    ...theme,
    templateRef,
    idePrimaryTokenRef,
    ideForegroundTokenRef,
    themeBackgroundTokenRef,
    themeForegroundTokenRef,
    lineNumberBackgroundTokenRef,
    lineNumberForegroundTokenRef,
    ideTabTokenRef,
    ideTabBarBackgroundTokenRef,
    ideTabBarForegroundTokenRef,
    editorPreviewScrollbarBackgroundTokenRef,
    editorPreviewScrollbarForegroundTokenRef,
    editorPreviewSelectionBackgroundTokenRef,
    editorPreviewMenuForegroundTokenRef,
    editorPreviewMenuBackgroundTokenRef,
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
