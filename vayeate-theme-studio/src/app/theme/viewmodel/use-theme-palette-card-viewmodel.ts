import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useContextSelector } from 'use-context-selector';
import type { ThemePaneState } from '../../../model/theme-pane-state';
import { buildThemePaneSnapshot } from '../../../model/theme-pane-state';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/components/AppProvider';
import { resolveColorForThemeTokenKey } from '../../../domain/utils/scope-resolver';
import { ThemeActionType } from '../actions/theme-action-type';
import {
  computeDisplayColorAssignments,
  computeSelectedColorsDisplay,
  normalizeThemeHex,
} from './theme-pane-display';

export function useThemePaletteCardViewModel() {
  const dispatch = useAppDispatch();
  const themes = useContextSelector(AppContext, (c) => {
    const slice = c?.state.themes;
    if (slice === undefined) {
      throw new Error('Theme state requires AppProvider.');
    }
    return slice;
  });
  const {
    selectedRef,
    theme,
    checkedColorRefs: checkedColorRefsArray,
    checkedContrastRefs: checkedContrastRefsArray,
    hueAdjustment,
    hueReferenceHex,
    loadedTemplateForTheme: loadedTemplate,
  } = themes;

  const checkedColorRefs = useMemo(() => new Set(checkedColorRefsArray), [checkedColorRefsArray]);

  const applyHueToDark = theme?.applyPaletteToDark ?? true;
  const applyHueToLight = theme?.applyPaletteToLight ?? true;
  const hueDragStartRef = useRef<{ theme: NonNullable<typeof theme>; hueAdjustment: number } | null>(null);

  const displayColorAssignments = useMemo(
    () =>
      computeDisplayColorAssignments(
        theme,
        hueAdjustment,
        checkedColorRefs,
        applyHueToDark,
        applyHueToLight,
      ),
    [theme, hueAdjustment, checkedColorRefs, applyHueToDark, applyHueToLight],
  );

  const selectedColorsDisplay = useMemo(
    () =>
      computeSelectedColorsDisplay(
        theme,
        checkedColorRefs,
        displayColorAssignments,
        applyHueToDark,
        applyHueToLight,
      ),
    [theme, checkedColorRefs, displayColorAssignments, applyHueToDark, applyHueToLight],
  );

  const lastSelectedRefForHueRef = useRef<{ name: string; version: string } | null>(null);
  useEffect(() => {
    if (!theme || !loadedTemplate || !selectedRef) return;
    if (theme.templateRef?.name !== loadedTemplate.name || theme.templateRef?.version !== loadedTemplate.version)
      return;
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

  const groupsFromTemplate = useMemo(() => loadedTemplate?.groups ?? [], [loadedTemplate]);

  function getBaseInPlace(t: NonNullable<typeof theme>) {
    return { ...t };
  }

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
      const normalized = normalizeThemeHex(hex) || '#FF0000';
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

  const openColorPicker = useCallback((): ThemePaneState => {
    return buildThemePaneSnapshot(
      theme,
      checkedColorRefsArray,
      checkedContrastRefsArray,
      hueAdjustment,
      hueReferenceHex,
    );
  }, [theme, checkedColorRefsArray, checkedContrastRefsArray, hueAdjustment, hueReferenceHex]);

  const setSelectedColorsPreview = useCallback(
    (hex: string) => {
      const normalized = normalizeThemeHex(hex);
      if (!normalized) return;
      dispatch({ type: ThemeActionType.ThemePaletteAssignColorPickerOnSelect, value: normalized });
    },
    [dispatch],
  );

  const closeColorPicker = useCallback(
    (_snapshot: ThemePaneState) => {
      dispatch({ type: ThemeActionType.ThemePaletteAssignColorPickerOnClose });
    },
    [dispatch],
  );

  const setSelectedColorsToHex = useCallback(
    (hex: string) => {
      const normalized = normalizeThemeHex(hex);
      if (!normalized) return;
      dispatch({ type: ThemeActionType.ThemePaletteAssignColorPickerOnCommit, value: normalized });
    },
    [dispatch],
  );

  return {
    theme,
    hueAdjustment,
    hueReferenceHex,
    onHueChange: setHueAdjustment,
    onHueReferenceChange: setHueReferenceHex,
    onRecenter: recenterHue,
    onHueDragStart: startHueDrag,
    onHueDragEnd: endHueDrag,
    applyToDark: applyHueToDark,
    applyToLight: applyHueToLight,
    onApplyToDarkChange: setApplyHueToDark,
    onApplyToLightChange: setApplyHueToLight,
    clusterCountK: theme?.paletteClusterCountK ?? 5,
    onClusterCountDelta,
    onClusterCountCommit,
    colorAssignments: displayColorAssignments,
    colorVariables: colorVariablesFromTemplate,
    groups: groupsFromTemplate,
    checkedColorRefs: checkedColorRefs as ReadonlySet<string>,
    onSetColorGroupChecked: setColorGroupChecked,
    onSetColorRefsChecked: setColorRefsChecked,
    selectedColorsDisplay,
    onSetSelectedColors: setSelectedColorsToHex,
    onColorPickerOpen: openColorPicker,
    onSetSelectedColorsPreview: setSelectedColorsPreview,
    onColorPickerClose: closeColorPicker,
  };
}
