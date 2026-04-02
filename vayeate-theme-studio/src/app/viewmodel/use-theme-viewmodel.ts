import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ThemePaneState } from '../../model/theme-pane-state';
import { useAppDispatch, useTemplatesState, useThemesState } from '../ui/context/slice-contexts';
import { getTemplateRefsFromTemplatesState } from '../../domain/state/template/templates-state';
import { getThemeRefsFromThemesState } from '../../domain/state/theme/themes-state';
import { compareVersions } from '../../domain/utils/version';
import { applyHueShift } from '../../domain/utils/color';
import { resolveColorForThemeTokenKey } from '../../domain/utils/scope-resolver';
import { ThemeActionType, type ThemePreviewTokenRefField } from '../actions/action-types';
import type {
  ColorAssignment,
  ContrastAssignmentValue,
  ContrastComparisonMethod,
  ContrastValue,
  ContrastVariable,
  TemplateReference,
  Theme,
  ThemeReference,
  TokenKey,
} from '../../model/schemas';

let themePageLoadDispatched = false;

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
  hueReferenceHex: string,
): ThemePaneState {
  return { theme, checkedColorRefs, checkedContrastRefs, hueAdjustment, hueReferenceHex };
}

export function useThemeViewModel() {
  const dispatch = useAppDispatch();
  const themes = useThemesState();
  const {
    selectedRef,
    theme,
    checkedColorRefs: checkedColorRefsArray,
    checkedContrastRefs: checkedContrastRefsArray,
    themeVariablesSearchText,
    previewVariableFilterText,
    selectedPreviewSampleKey,
    hueAdjustment,
    hueReferenceHex,
    isCreating,
    createDialogOpen,
    generateResult,
    saveError,
    loadedTemplateForTheme: loadedTemplate,
  } = themes;
  const templates = useTemplatesState();
  const themeRefs = useMemo(() => getThemeRefsFromThemesState(themes), [themes]);
  const templateRefs = useMemo(() => getTemplateRefsFromTemplatesState(templates), [templates]);

  const checkedColorRefs = useMemo(() => new Set(checkedColorRefsArray), [checkedColorRefsArray]);
  const checkedContrastRefs = useMemo(() => new Set(checkedContrastRefsArray), [checkedContrastRefsArray]);

  useEffect(() => {
    if (themePageLoadDispatched) return;
    themePageLoadDispatched = true;
    dispatch({ type: ThemeActionType.ThemePageOnLoad });
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

  const applyHueToDark = theme?.applyPaletteToDark ?? true;
  const applyHueToLight = theme?.applyPaletteToLight ?? true;
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

  // When a theme is loaded (selection changes), set hue reference to the resolved IDE Background color for the preview.
  const lastSelectedRefForHueRef = useRef<{ name: string; version: string } | null>(null);
  useEffect(() => {
    if (!theme || !loadedTemplate || !selectedRef) return;
    if (theme.templateRef?.name !== loadedTemplate.name || theme.templateRef?.version !== loadedTemplate.version) return;
    const currentKey = { name: selectedRef.name, version: selectedRef.version };
    const prev = lastSelectedRefForHueRef.current;
    if (prev && prev.name === currentKey.name && prev.version === currentKey.version) return;
    lastSelectedRefForHueRef.current = currentKey;
    const tokenRef = theme.themeBackgroundTokenRef ?? null;
    const mappings = loadedTemplate.mappings ?? [];
    const resolved = resolveColorForThemeTokenKey(
      tokenRef,
      mappings,
      theme.colorAssignments,
      theme.contrastAssignments,
      loadedTemplate.contrastVariables,
      'dark',
      '#1e1e1e',
    );
    const normalized = resolved.startsWith('#') ? resolved : `#${resolved}`;
    dispatch({ type: ThemeActionType.ThemePaletteHueReferenceColorTextOnChange, value: normalized });
  }, [theme, loadedTemplate, selectedRef, dispatch]);

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

  // --- Actions ---

  const selectTheme = useCallback(
    (name: string, version: string) => {
      dispatch({ type: ThemeActionType.ThemeThemesVersionListOnCommit, name, version });
    },
    [dispatch],
  );

  const selectName = useCallback(
    (name: string) => {
      dispatch({ type: ThemeActionType.ThemeThemesNameListOnCommit, name });
    },
    [dispatch],
  );

  const openCreateDialog = useCallback(() => {
    dispatch({ type: ThemeActionType.ThemeThemesCreateButtonOnClick });
    dispatch({ type: ThemeActionType.ThemeCreateDialogOnOpen });
  }, [dispatch]);

  const closeCreateDialog = useCallback(() => {
    dispatch({ type: ThemeActionType.ThemeCreateDialogCancelButtonOnClick });
  }, [dispatch]);

  const createTheme = useCallback(
    (params: { name: string }) => {
      dispatch({ type: ThemeActionType.ThemeCreateDialogOkButtonOnClick, params });
    },
    [dispatch],
  );

  const deleteVersion = useCallback(
    (name: string, version: string) => {
      dispatch({ type: ThemeActionType.ThemeDetailsDeleteVersionButtonOnClick, name, version });
    },
    [dispatch],
  );

  const generateTheme = useCallback(() => {
    if (!canGenerate || !theme?.templateRef) {
      return;
    }
    dispatch({
      type: ThemeActionType.ThemeDetailsGenerateButtonOnClick,
      themeName: theme.name,
      themeVersion: theme.version,
      templateName: theme.templateRef.name,
      templateVersion: theme.templateRef.version,
    });
  }, [canGenerate, dispatch, theme]);

  const bumpVersion = useCallback(() => {
    dispatch({ type: ThemeActionType.ThemeDetailsIncrementVersionButtonOnClick });
  }, [dispatch]);

  // --- Template selection ---

  const changeTemplate = useCallback(
    (templateName: string, version?: string) => {
      const versions = templateVersionsByName[templateName];
      if (!versions || versions.length === 0) return;
      const selectedVersion = version ?? versions[0].version;
      dispatch({ type: ThemeActionType.ThemeDetailsTemplateListOnCommit, name: templateName, version: selectedVersion });
    },
    [dispatch, templateVersionsByName],
  );

  const changeTemplateVersion = useCallback(
    (version: string) => {
      if (!theme?.templateRef) return;
      dispatch({ type: ThemeActionType.ThemeDetailsTemplateVersionListOnCommit, name: theme.templateRef.name, version });
    },
    [dispatch, theme],
  );

  // --- Preview token refs (no version bump) ---

  const dispatchPreviewTokenRef = useCallback(
    (tokenRefField: ThemePreviewTokenRefField, value: TokenKey | null) => {
      dispatch({ type: ThemeActionType.ThemeDetailsPreviewTokenRefListOnCommit, tokenRefField, value });
    },
    [dispatch],
  );
  const changeIdePrimaryTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('idePrimaryTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );
  const changeIdeForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('ideForegroundTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );
  const changeThemeBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('themeBackgroundTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );
  const changeThemeForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('themeForegroundTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );
  const changeLineNumberBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('lineNumberBackgroundTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );
  const changeLineNumberForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('lineNumberForegroundTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );
  const changeIdeTabTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('ideTabTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );
  const changeIdeTabBarBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('ideTabBarBackgroundTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );
  const changeIdeTabBarForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('ideTabBarForegroundTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );
  const changeEditorPreviewScrollbarBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('editorPreviewScrollbarBackgroundTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );
  const changeEditorPreviewScrollbarForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('editorPreviewScrollbarForegroundTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );
  const changeEditorPreviewSelectionBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('editorPreviewSelectionBackgroundTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );
  const changeEditorPreviewMenuForegroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('editorPreviewMenuForegroundTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );
  const changeEditorPreviewMenuBackgroundTokenRef = useCallback(
    (tokenKey: TokenKey | null) => dispatchPreviewTokenRef('editorPreviewMenuBackgroundTokenRef', tokenKey),
    [dispatchPreviewTokenRef],
  );

  const setHueAdjustment = useCallback(
    (value: number) => {
      dispatch({ type: ThemeActionType.ThemePaletteHueSliderOnDelta, value });
    },
    [dispatch],
  );

  const setApplyHueToDark = useCallback(
    (checked: boolean) => {
      dispatch({ type: ThemeActionType.ThemePaletteApplyToDarkCheckboxOnToggle, checked });
    },
    [dispatch],
  );

  const setApplyHueToLight = useCallback(
    (checked: boolean) => {
      dispatch({ type: ThemeActionType.ThemePaletteApplyToLightCheckboxOnToggle, checked });
    },
    [dispatch],
  );

  const onClusterCountDelta = useCallback(
    (value: number) => {
      dispatch({ type: ThemeActionType.ThemePaletteClusterCountSliderOnDelta, value });
    },
    [dispatch],
  );

  const onClusterCountCommit = useCallback(
    (value: number) => {
      dispatch({ type: ThemeActionType.ThemePaletteClusterCountSliderOnCommit, value });
    },
    [dispatch],
  );

  const setHueReferenceHex = useCallback(
    (hex: string) => {
      const normalized = normalizeHex(hex) || '#FF0000';
      dispatch({ type: ThemeActionType.ThemePaletteHueReferenceColorTextOnChange, value: normalized });
      dispatch({ type: ThemeActionType.ThemePaletteHueSliderOnDelta, value: 0 });
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
    dispatch({ type: ThemeActionType.ThemePaletteHueReferenceRecenterButtonOnClick });
  }, [dispatch]);

  // --- Color assignment updates (no version bump) ---

  const updateColorAssignmentDark = useCallback(
    (colorRef: string, value: string | null) => {
      dispatch({
        type: ThemeActionType.ThemeVariablesColorDarkTextOnCommit,
        ref: colorRef,
        value: value ?? '',
      });
    },
    [dispatch],
  );

  const updateColorAssignmentLight = useCallback(
    (colorRef: string, value: string | null) => {
      dispatch({
        type: ThemeActionType.ThemeVariablesColorLightTextOnCommit,
        ref: colorRef,
        value: value ?? '',
      });
    },
    [dispatch],
  );

  const updateColorAssignmentUseDarkForLight = useCallback(
    (colorRef: string, useDark: boolean) => {
      dispatch({
        type: ThemeActionType.ThemeVariablesColorUseDarkForLightCheckboxOnToggle,
        ref: colorRef,
        checked: useDark,
      });
    },
    [dispatch],
  );

  // --- Contrast assignment updates (no version bump) ---

  const updateContrastAssignmentDark = useCallback(
    (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => {
      if (field === 'value') {
        dispatch({
          type: ThemeActionType.ThemeVariablesContrastDarkValueTextOnCommit,
          ref: contrastRef,
          value: value as ContrastValue,
        });
      } else if (field === 'comparisonMethod') {
        dispatch({
          type: ThemeActionType.ThemeVariablesContrastDarkMethodListOnCommit,
          ref: contrastRef,
          value: value as ContrastComparisonMethod,
        });
      } else if (field === 'min') {
        dispatch({
          type: ThemeActionType.ThemeVariablesContrastDarkMinTextOnCommit,
          ref: contrastRef,
          value: value != null ? String(value) : '',
        });
      } else if (field === 'max') {
        dispatch({
          type: ThemeActionType.ThemeVariablesContrastDarkMaxTextOnCommit,
          ref: contrastRef,
          value: value != null ? String(value) : '',
        });
      }
    },
    [dispatch],
  );

  const updateContrastAssignmentLight = useCallback(
    (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => {
      if (field === 'value') {
        dispatch({
          type: ThemeActionType.ThemeVariablesContrastLightValueTextOnCommit,
          ref: contrastRef,
          value: value as ContrastValue,
        });
      } else if (field === 'comparisonMethod') {
        dispatch({
          type: ThemeActionType.ThemeVariablesContrastLightMethodListOnCommit,
          ref: contrastRef,
          value: value as ContrastComparisonMethod,
        });
      } else if (field === 'min') {
        dispatch({
          type: ThemeActionType.ThemeVariablesContrastLightMinTextOnCommit,
          ref: contrastRef,
          value: value != null ? String(value) : '',
        });
      } else if (field === 'max') {
        dispatch({
          type: ThemeActionType.ThemeVariablesContrastLightMaxTextOnCommit,
          ref: contrastRef,
          value: value != null ? String(value) : '',
        });
      }
    },
    [dispatch],
  );

  const updateContrastAssignmentUseDarkForLight = useCallback(
    (contrastRef: string, useDark: boolean) => {
      dispatch({
        type: ThemeActionType.ThemeVariablesLightUseDarkCheckboxOnToggle,
        ref: contrastRef,
        checked: useDark,
      });
    },
    [dispatch],
  );

  const toggleColorChecked = useCallback(
    (ref: string) => {
      dispatch({ type: ThemeActionType.ThemeVariablesVariableSelectionCheckboxOnToggle, ref, checked: !checkedColorRefs.has(ref) });
    },
    [dispatch, checkedColorRefs],
  );

  const toggleContrastChecked = useCallback(
    (ref: string) => {
      dispatch({ type: ThemeActionType.ThemeVariablesVariableSelectionCheckboxOnToggle, ref, checked: !checkedContrastRefs.has(ref) });
    },
    [dispatch, checkedContrastRefs],
  );

  const setAllColorChecked = useCallback(
    (checked: boolean) => {
      dispatch({
        type: ThemeActionType.ThemeVariablesSelectVariableTypeCheckboxOnToggle,
        variableType: 'color',
        checked,
      });
    },
    [dispatch],
  );

  const setAllContrastChecked = useCallback(
    (checked: boolean) => {
      dispatch({
        type: ThemeActionType.ThemeVariablesSelectVariableTypeCheckboxOnToggle,
        variableType: 'contrast',
        checked,
      });
    },
    [dispatch],
  );

  const setAllVariablesChecked = useCallback(
    (checked: boolean) => {
      dispatch({ type: ThemeActionType.ThemeVariablesSelectAllCheckboxOnToggle, checked });
    },
    [dispatch],
  );

  const setColorGroupChecked = useCallback(
    (groupKey: string, checked: boolean) => {
      dispatch({
        type: ThemeActionType.ThemeVariablesSelectVariableGroupCheckboxOnToggle,
        groupId: groupKey,
        checked,
      });
    },
    [dispatch],
  );

  const setContrastGroupChecked = useCallback(
    (groupKey: string, checked: boolean) => {
      dispatch({
        type: ThemeActionType.ThemeVariablesSelectVariableGroupCheckboxOnToggle,
        groupId: groupKey,
        checked,
      });
    },
    [dispatch],
  );

  const setColorRefsChecked = useCallback(
    (refs: string[], checked: boolean) => {
      if (!theme || refs.length === 0) return;
      refs.forEach((ref) => {
        dispatch({
          type: ThemeActionType.ThemeVariablesVariableSelectionCheckboxOnToggle,
          ref,
          checked,
        });
      });
    },
    [theme, dispatch],
  );

  const setVariablesSearchText = useCallback(
    (value: string) => {
      dispatch({ type: ThemeActionType.ThemeVariablesSearchTextOnChange, value });
    },
    [dispatch],
  );

  const commitPreviewVariable = useCallback(
    (value: string) => {
      dispatch({ type: ThemeActionType.ThemePreviewVariableListOnCommit, value });
    },
    [dispatch],
  );

  const setPreviewVariableFilterText = useCallback(
    (value: string) => {
      dispatch({ type: ThemeActionType.ThemePreviewVariableFilterTextOnChange, value });
    },
    [dispatch],
  );

  const clearPreviewVariableFilter = useCallback(() => {
    dispatch({ type: ThemeActionType.ThemePreviewVariableFilterClearOnClick });
  }, [dispatch]);

  const previewSampleButtonClick = useCallback(() => {
    dispatch({ type: ThemeActionType.ThemePreviewSampleButtonOnClick });
  }, [dispatch]);

  const commitPreviewSample = useCallback(
    (value: string) => {
      dispatch({ type: ThemeActionType.ThemePreviewSampleListOnCommit, value });
    },
    [dispatch],
  );

  /** Returns current theme-pane state snapshot for color-picker undo (revert all changes when picker closes). */
  const openColorPicker = useCallback((): ThemePaneState => {
    return themePaneStateFromState(theme, checkedColorRefsArray, checkedContrastRefsArray, hueAdjustment, hueReferenceHex);
  }, [theme, checkedColorRefsArray, checkedContrastRefsArray, hueAdjustment, hueReferenceHex]);

  /** Applies hex to selected variables (preview only; no persist). Use while color picker is open. */
  const setSelectedColorsPreview = useCallback(
    (hex: string) => {
      const normalized = normalizeHex(hex);
      if (!normalized) return;
      dispatch({ type: ThemeActionType.ThemePaletteAssignColorPickerOnSelect, value: normalized });
    },
    [dispatch],
  );

  /** Persist current theme when color picker closes. */
  const closeColorPicker = useCallback(
    (_snapshot: ThemePaneState) => {
      dispatch({ type: ThemeActionType.ThemePaletteAssignColorPickerOnClose });
    },
    [dispatch],
  );

  const setSelectedColorsToHex = useCallback(
    (hex: string) => {
      const normalized = normalizeHex(hex);
      if (!normalized) return;
      dispatch({ type: ThemeActionType.ThemePaletteAssignColorPickerOnCommit, value: normalized });
    },
    [dispatch],
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
    hueReferenceHex,
    setHueAdjustment,
    setHueReferenceHex,
    startHueDrag,
    endHueDrag,
    recenterHue,
    applyHueToDark,
    applyHueToLight,
    setApplyHueToDark,
    setApplyHueToLight,
    paletteClusterCountK: theme?.paletteClusterCountK ?? 5,
    onClusterCountDelta,
    onClusterCountCommit,
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
    themeVariablesSearchText,
    setVariablesSearchText,
    previewVariableFilterText,
    selectedPreviewSampleKey,
    commitPreviewVariable,
    setPreviewVariableFilterText,
    clearPreviewVariableFilter,
    previewSampleButtonClick,
    commitPreviewSample,
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
      dispatch({ type: ThemeActionType.ThemePageSaveErrorDismissButtonOnClick });
    }, [dispatch]),
  };
}

export { mergeAssignmentsFromTemplate } from '../../domain/utils/theme-template-merge';

export function computeOrphanColorKeys(theme: Theme | null): Set<string> {
  if (!theme || !theme.templateRef) return new Set();
  return new Set<string>();
}

export function computeOrphanContrastKeys(theme: Theme | null): Set<string> {
  if (!theme || !theme.templateRef) return new Set();
  return new Set<string>();
}
