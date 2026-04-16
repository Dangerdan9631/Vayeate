import { useCallback, useEffect, useMemo, useRef } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import type { ThemePaneState } from '../../../model/theme-pane-state';
import { buildThemePaneSnapshot } from '../../../domain/utils/theme-pane-utils';
import { ThemesStore } from '../../../domain/state/theme/themes-store';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { resolveColorForThemeTokenKey } from '../../../domain/utils/scope-resolver';
import { ThemeActionType } from '../actions/theme-action-type';
import { normalizeThemeHex } from '../../../domain/utils/normalize-theme-hex';

const themesStore = container.resolve(ThemesStore);

export function useThemePaletteCardViewModel() {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(themesStore.api, (state) => state.state.selectedRef);
  const theme = useStore(themesStore.api, (state) => state.state.theme);
  const checkedColorRefsArray = useStore(themesStore.api, (state) => state.state.checkedColorRefs);
  const checkedContrastRefsArray = useStore(themesStore.api, (state) => state.state.checkedContrastRefs);
  const hueAdjustment = useStore(themesStore.api, (state) => state.state.hueAdjustment);
  const hueReferenceHex = useStore(themesStore.api, (state) => state.state.hueReferenceHex);
  const loadedTemplate = useStore(themesStore.api, (state) => state.state.loadedTemplateForTheme);
  const paneDisplayColorAssignments = useStore(themesStore.api, (state) => state.state.paneDisplayColorAssignments);
  const paneSelectedColorsDisplay = useStore(themesStore.api, (state) => state.state.paneSelectedColorsDisplay);
  const checkedColorRefs = useMemo(() => new Set<string>(checkedColorRefsArray), [checkedColorRefsArray]);

  const applyHueToDark = theme?.applyPaletteToDark ?? true;
  const applyHueToLight = theme?.applyPaletteToLight ?? true;
  const hueDragStartRef = useRef<{ theme: NonNullable<typeof theme>; hueAdjustment: number } | null>(null);

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
    dispatch({ type: ThemeActionType.ThemePaletteHueReferenceCommit, value: normalized });
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
      dispatch({ type: ThemeActionType.ThemePaletteHueReferenceCommit, value: normalized });
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
      dispatch({
        type: ThemeActionType.ThemePaletteColorRefsSelectionCommit,
        refs,
        checked,
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

  const onHueReferenceEyedropperClick = useCallback(() => {
    void dispatch({ type: ThemeActionType.ThemePaletteHueReferenceColorEyedropperButtonOnClick });
  }, [dispatch]);

  const onAssignEyedropperClick = useCallback(
    (colorRef: string) => {
      void dispatch({
        type: ThemeActionType.ThemePaletteAssignColorEyedropperButtonOnClick,
        colorRef,
      });
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
    colorAssignments: paneDisplayColorAssignments,
    colorVariables: colorVariablesFromTemplate,
    groups: groupsFromTemplate,
    checkedColorRefs: checkedColorRefs as ReadonlySet<string>,
    onSetColorGroupChecked: setColorGroupChecked,
    onSetColorRefsChecked: setColorRefsChecked,
    selectedColorsDisplay: paneSelectedColorsDisplay,
    onSetSelectedColors: setSelectedColorsToHex,
    onColorPickerOpen: openColorPicker,
    onSetSelectedColorsPreview: setSelectedColorsPreview,
    onColorPickerClose: closeColorPicker,
    onHueReferenceEyedropperClick,
    onAssignEyedropperClick,
  };
}

