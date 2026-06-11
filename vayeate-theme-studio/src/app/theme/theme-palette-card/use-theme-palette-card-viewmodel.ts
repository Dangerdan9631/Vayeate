import { useCallback, useEffect, useMemo, useRef } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import type { ThemePaneState } from '../../../model/theme-pane-state';
import { buildThemePaneSnapshot } from '../../../domain/utils/theme-pane-utils';
import { ThemePreviewStore } from '../../../domain/state/ui/theme-preview-store';
import { ThemeUiStore } from '../../../domain/state/ui/theme-ui-store';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { resolveColorForThemeTokenKey } from '../../../domain/utils/scope-resolver';
import { ThemePaletteCardActionType } from './actions/theme-palette-card-action-type';
import { ThemeVariablesCardActionType } from '../theme-variables-card/actions/theme-variables-card-action-type';
import { normalizeThemeHex } from '../../../domain/utils/normalize-theme-hex';

const themeUiStore = container.resolve(ThemeUiStore);
const themePreviewStore = container.resolve(ThemePreviewStore);

/**
 * Exposes Theme Palette Card state and dispatches user or lifecycle actions.
 */
export function useThemePaletteCardViewModel() {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(themeUiStore.api, (state) => state.state.selectedRef);
  const theme = useStore(themeUiStore.api, (state) => state.state.theme);
  const checkedColorRefsArray = useStore(themeUiStore.api, (state) => state.state.checkedColorRefs);
  const checkedContrastRefsArray = useStore(themeUiStore.api, (state) => state.state.checkedContrastRefs);
  const hueAdjustment = useStore(themeUiStore.api, (state) => state.state.hueAdjustment);
  const hueReferenceHex = useStore(themeUiStore.api, (state) => state.state.hueReferenceHex);
  const previewClusterCountK = useStore(themeUiStore.api, (state) => state.state.previewClusterCountK);
  const loadedTemplate = useStore(themePreviewStore.api, (state) => state.state.loadedTemplateForTheme);
  const paneDisplayColorAssignments = useStore(themeUiStore.api, (state) => state.state.paneDisplayColorAssignments);
  const paneSelectedColorsDisplay = useStore(themeUiStore.api, (state) => state.state.paneSelectedColorsDisplay);
  const paletteClustersByGroup = useStore(themeUiStore.api, (state) => state.state.paletteClustersByGroup);
  const paletteClusterByDark = useStore(themeUiStore.api, (state) => state.state.paletteClusterByDark);
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
    void dispatch({ type: ThemePaletteCardActionType.HueReferenceCommit, value: normalized });
  }, [theme, loadedTemplate, selectedRef, dispatch]);

  const colorVariablesFromTemplate = useMemo(
    () => loadedTemplate?.colorVariables ?? [],
    [loadedTemplate],
  );

  const groupsFromTemplate = useMemo(() => loadedTemplate?.groups ?? [], [loadedTemplate]);

  const clusterCountK = previewClusterCountK ?? theme?.paletteClusterCountK ?? 5;

  useEffect(() => {
    if (!theme?.templateRef) return;
    void dispatch({ type: ThemePaletteCardActionType.RecomputeClusters });
  }, [
    paneDisplayColorAssignments,
    colorVariablesFromTemplate,
    clusterCountK,
    paletteClusterByDark,
    theme?.templateRef,
    dispatch,
  ]);

  const setHueAdjustment = useCallback(
    (value: number) => {
      void dispatch({ type: ThemePaletteCardActionType.HueSliderOnDelta, value });
    },
    [dispatch],
  );

  const setApplyHueToDark = useCallback(
    (checked: boolean) => {
      void dispatch({ type: ThemePaletteCardActionType.ApplyToDarkCheckboxOnToggle, checked });
    },
    [dispatch],
  );

  const setApplyHueToLight = useCallback(
    (checked: boolean) => {
      void dispatch({ type: ThemePaletteCardActionType.ApplyToLightCheckboxOnToggle, checked });
    },
    [dispatch],
  );

  const onClusterCountDelta = useCallback(
    (value: number) => {
      void dispatch({ type: ThemePaletteCardActionType.ClusterCountSliderOnDelta, value });
    },
    [dispatch],
  );

  const onClusterCountCommit = useCallback(
    (value: number) => {
      void dispatch({ type: ThemePaletteCardActionType.ClusterCountSliderOnCommit, value });
    },
    [dispatch],
  );

  const onClusterByDarkChange = useCallback(
    (checked: boolean) => {
      void dispatch({ type: ThemePaletteCardActionType.ClusterVariantCheckboxOnToggle, checked });
    },
    [dispatch],
  );

  const setHueReferenceHex = useCallback(
    (hex: string) => {
      const normalized = normalizeThemeHex(hex) || '#FF0000';
      void dispatch({ type: ThemePaletteCardActionType.HueReferenceCommit, value: normalized });
    },
    [dispatch],
  );

  const startHueDrag = useCallback(() => {
    if (!theme) return;
    hueDragStartRef.current = { theme: { ...theme }, hueAdjustment };
  }, [theme, hueAdjustment]);

  const endHueDrag = useCallback(() => {
    hueDragStartRef.current = null;
  }, []);

  const recenterHue = useCallback(() => {
    void dispatch({ type: ThemePaletteCardActionType.HueReferenceRecenterButtonOnClick });
  }, [dispatch]);

  const setColorGroupChecked = useCallback(
    (groupKey: string, checked: boolean) => {
      void dispatch({
        type: ThemeVariablesCardActionType.SelectVariableGroupCheckboxOnToggle,
        groupId: groupKey,
        checked,
      });
    },
    [dispatch],
  );

  const setColorRefsChecked = useCallback(
    (refs: string[], checked: boolean) => {
      if (!theme || refs.length === 0) return;
      void dispatch({
        type: ThemePaletteCardActionType.ColorRefsSelectionCommit,
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
      void dispatch({ type: ThemePaletteCardActionType.AssignColorPickerOnSelect, value: normalized });
    },
    [dispatch],
  );

  const closeColorPicker = useCallback(
    (snapshot: ThemePaneState, hex: string) => {
      const normalized = normalizeThemeHex(hex);
      if (!normalized) return;
      void dispatch({ type: ThemePaletteCardActionType.AssignColorPickerOnClose, value: normalized, snapshot });
    },
    [dispatch],
  );

  const onHueReferenceEyedropperClick = useCallback(() => {
    void dispatch({ type: ThemePaletteCardActionType.HueReferenceColorEyedropperButtonOnClick });
  }, [dispatch]);

  const onAssignEyedropperClick = useCallback(
    () => {
      void dispatch({
        type: ThemePaletteCardActionType.AssignColorEyedropperButtonOnClick
      });
    },
    [dispatch],
  );

  const setSelectedColorsToHex = useCallback(
    (hex: string) => {
      const normalized = normalizeThemeHex(hex);
      if (!normalized) return;
      void dispatch({ type: ThemePaletteCardActionType.AssignColorPickerOnCommit, value: normalized });
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
    clusterCountK,
    onClusterCountDelta,
    onClusterCountCommit,
    clusterByDark: paletteClusterByDark,
    onClusterByDarkChange,
    paletteClustersByGroup,
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

