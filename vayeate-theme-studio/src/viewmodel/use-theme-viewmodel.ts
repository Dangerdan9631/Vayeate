import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useThemesState, useTemplatesState } from '../ui/context/slice-contexts';
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

export function useThemeViewModel() {
  const dispatch = useAppDispatch();
  const { themeRefs, selectedRef, theme, isCreating, createDialogOpen, generateResult, saveError } = useThemesState();
  const { templateRefs } = useTemplatesState();

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
  const [hueAdjustment, setHueAdjustment] = useState(0);
  const [applyHueToDark, setApplyHueToDark] = useState(true);
  const [applyHueToLight, setApplyHueToLight] = useState(true);
  const [checkedColorRefs, setCheckedColorRefs] = useState<Set<string>>(new Set());
  const [checkedContrastRefs, setCheckedContrastRefs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!theme) {
      setCheckedColorRefs(new Set());
      setCheckedContrastRefs(new Set());
      return;
    }
    setCheckedColorRefs(new Set(theme.colorAssignments.map((a) => a.colorRef)));
    setCheckedContrastRefs(new Set(theme.contrastAssignments.map((a) => a.contrastVariableRef)));
  }, [theme]);

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

  // --- Preview token refs (no version bump) ---

  const changeIdePrimaryTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      log.debug('changeIdePrimaryTokenRef', tokenKey);
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SAVE_THEME', theme: { ...base, idePrimaryTokenRef: tokenKey } });
    },
    [dispatch, theme],
  );
  const changeThemeBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      log.debug('changeThemeBackgroundTokenRef', tokenKey);
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SAVE_THEME', theme: { ...base, themeBackgroundTokenRef: tokenKey } });
    },
    [dispatch, theme],
  );
  const changeLineNumberBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SAVE_THEME', theme: { ...base, lineNumberBackgroundTokenRef: tokenKey } });
    },
    [dispatch, theme],
  );
  const changeLineNumberForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SAVE_THEME', theme: { ...base, lineNumberForegroundTokenRef: tokenKey } });
    },
    [dispatch, theme],
  );
  const changeIdeTabTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SAVE_THEME', theme: { ...base, ideTabTokenRef: tokenKey } });
    },
    [dispatch, theme],
  );
  const changeIdeTabBarBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SAVE_THEME', theme: { ...base, ideTabBarBackgroundTokenRef: tokenKey } });
    },
    [dispatch, theme],
  );
  const changeIdeTabBarForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SAVE_THEME', theme: { ...base, ideTabBarForegroundTokenRef: tokenKey } });
    },
    [dispatch, theme],
  );
  const changeEditorPreviewScrollbarBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SAVE_THEME', theme: { ...base, editorPreviewScrollbarBackgroundTokenRef: tokenKey } });
    },
    [dispatch, theme],
  );
  const changeEditorPreviewScrollbarForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SAVE_THEME', theme: { ...base, editorPreviewScrollbarForegroundTokenRef: tokenKey } });
    },
    [dispatch, theme],
  );
  const changeEditorPreviewSelectionBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => {
      if (!theme) return;
      const base = getBaseInPlace(theme);
      dispatch({ type: 'SAVE_THEME', theme: { ...base, editorPreviewSelectionBackgroundTokenRef: tokenKey } });
    },
    [dispatch, theme],
  );

  const commitHueAdjustment = useCallback(() => {
    if (!theme || hueAdjustment === 0) return;
    log.debug('commitHueAdjustment', hueAdjustment);
    const base = getBaseInPlace(theme);
    const newAssignments = applyHueToAssignmentsFiltered(
      theme.colorAssignments,
      hueAdjustment / 100,
      checkedColorRefs,
      { applyToDark: applyHueToDark, applyToLight: applyHueToLight },
    );
    dispatch({ type: 'SAVE_THEME', theme: { ...base, colorAssignments: newAssignments } });
    setHueAdjustment(0);
  }, [dispatch, theme, hueAdjustment, checkedColorRefs, applyHueToDark, applyHueToLight]);

  const revertHueAdjustment = useCallback(() => {
    setHueAdjustment(0);
  }, []);

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
        setHueAdjustment(0);
      }
      const newAssignments = workingAssignments.map((a) =>
        a.colorRef === colorRef
          ? { ...a, dark: value !== null ? { value } : null }
          : a,
      );
      dispatch({ type: 'SAVE_THEME', theme: { ...base, colorAssignments: newAssignments } });
    },
    [dispatch, theme, hueAdjustment, checkedColorRefs, applyHueToDark, applyHueToLight],
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
        setHueAdjustment(0);
      }
      const newAssignments = workingAssignments.map((a) =>
        a.colorRef === colorRef
          ? { ...a, light: value !== null ? { value } : null }
          : a,
      );
      dispatch({ type: 'SAVE_THEME', theme: { ...base, colorAssignments: newAssignments } });
    },
    [dispatch, theme, hueAdjustment, checkedColorRefs, applyHueToDark, applyHueToLight],
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
        setHueAdjustment(0);
      }
      const newAssignments = workingAssignments.map((a) =>
        a.colorRef === colorRef ? { ...a, useDarkForLight: useDark } : a,
      );
      dispatch({ type: 'SAVE_THEME', theme: { ...base, colorAssignments: newAssignments } });
    },
    [dispatch, theme, hueAdjustment, checkedColorRefs, applyHueToDark, applyHueToLight],
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

  const toggleColorChecked = useCallback((ref: string) => {
    setCheckedColorRefs((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  }, []);

  const toggleContrastChecked = useCallback((ref: string) => {
    setCheckedContrastRefs((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  }, []);

  const setAllColorChecked = useCallback((checked: boolean) => {
    setCheckedColorRefs((prev) => {
      if (!theme) return prev;
      return checked
        ? new Set(theme.colorAssignments.map((a) => a.colorRef))
        : new Set();
    });
  }, [theme]);

  const setAllContrastChecked = useCallback((checked: boolean) => {
    setCheckedContrastRefs((prev) => {
      if (!theme) return prev;
      return checked
        ? new Set(theme.contrastAssignments.map((a) => a.contrastVariableRef))
        : new Set();
    });
  }, [theme]);

  const setAllVariablesChecked = useCallback(
    (checked: boolean) => {
      if (!theme) return;
      if (checked) {
        setCheckedColorRefs(new Set(theme.colorAssignments.map((a) => a.colorRef)));
        setCheckedContrastRefs(new Set(theme.contrastAssignments.map((a) => a.contrastVariableRef)));
      } else {
        setCheckedColorRefs(new Set());
        setCheckedContrastRefs(new Set());
      }
    },
    [theme],
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
      setCheckedColorRefs((prev) => {
        const next = new Set(prev);
        refsInGroup.forEach((r) => (checked ? next.add(r) : next.delete(r)));
        return next;
      });
    },
    [theme, colorVariablesFromTemplate],
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
      setCheckedContrastRefs((prev) => {
        const next = new Set(prev);
        refsInGroup.forEach((r) => (checked ? next.add(r) : next.delete(r)));
        return next;
      });
    },
    [theme, contrastVariablesFromTemplate],
  );

  const setColorRefsChecked = useCallback(
    (refs: string[], checked: boolean) => {
      if (!theme || refs.length === 0) return;
      setCheckedColorRefs((prev) => {
        const next = new Set(prev);
        refs.forEach((r) => (checked ? next.add(r) : next.delete(r)));
        return next;
      });
    },
    [theme],
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
    applyHueToDark,
    applyHueToLight,
    setApplyHueToDark,
    setApplyHueToLight,
    displayColorAssignments,
    commitHueAdjustment,
    revertHueAdjustment,
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
    changeThemeBackgroundTokenRef,
    changeLineNumberBackgroundTokenRef,
    changeLineNumberForegroundTokenRef,
    changeIdeTabTokenRef,
    changeIdeTabBarBackgroundTokenRef,
    changeIdeTabBarForegroundTokenRef,
    changeEditorPreviewScrollbarBackgroundTokenRef,
    changeEditorPreviewScrollbarForegroundTokenRef,
    changeEditorPreviewSelectionBackgroundTokenRef,
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
  const themeBackgroundTokenRef = validTokenRef(theme.themeBackgroundTokenRef);
  const lineNumberBackgroundTokenRef = validTokenRef(theme.lineNumberBackgroundTokenRef);
  const lineNumberForegroundTokenRef = validTokenRef(theme.lineNumberForegroundTokenRef);
  const ideTabTokenRef = validTokenRef(theme.ideTabTokenRef);
  const ideTabBarBackgroundTokenRef = validTokenRef(theme.ideTabBarBackgroundTokenRef);
  const ideTabBarForegroundTokenRef = validTokenRef(theme.ideTabBarForegroundTokenRef);
  const editorPreviewScrollbarBackgroundTokenRef = validTokenRef(theme.editorPreviewScrollbarBackgroundTokenRef);
  const editorPreviewScrollbarForegroundTokenRef = validTokenRef(theme.editorPreviewScrollbarForegroundTokenRef);
  const editorPreviewSelectionBackgroundTokenRef = validTokenRef(theme.editorPreviewSelectionBackgroundTokenRef);

  return {
    ...theme,
    templateRef,
    idePrimaryTokenRef,
    themeBackgroundTokenRef,
    lineNumberBackgroundTokenRef,
    lineNumberForegroundTokenRef,
    ideTabTokenRef,
    ideTabBarBackgroundTokenRef,
    ideTabBarForegroundTokenRef,
    editorPreviewScrollbarBackgroundTokenRef,
    editorPreviewScrollbarForegroundTokenRef,
    editorPreviewSelectionBackgroundTokenRef,
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
