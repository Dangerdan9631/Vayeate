import { useCallback, useEffect, useMemo, useRef } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { ThemePaneState } from '../../../model/theme-pane-state';
import { buildThemePaneSnapshot } from '../../../domain/utils/theme-pane-utils';
import { ThemePreviewStore } from '../../../domain/state/ui/theme-preview-store';
import { ThemeUiStore } from '../../../domain/state/ui/theme-ui-store';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { resolveColorForThemeTokenKey } from '../../../domain/utils/scope-resolver';
import { ThemePaletteCardActionType } from './actions/theme-palette-card-action-type';
import { ThemeVariablesCardActionType } from '../theme-variables-card/actions/theme-variables-card-action-type';
import { normalizeThemeHex } from '../../../domain/utils/normalize-theme-hex';
import type { ColorAssignment, ContrastAssignment, Theme } from '../../../model/schema/theme-schemas';
import type { ColorVariable, ContrastVariable, Mapping } from '../../../model/schema/template-schemas';

const themeUiStore = container.resolve(ThemeUiStore);
const themePreviewStore = container.resolve(ThemePreviewStore);

const EMPTY_COLOR_ASSIGNMENTS: readonly ColorAssignment[] = [];
const EMPTY_CONTRAST_ASSIGNMENTS: readonly ContrastAssignment[] = [];
const EMPTY_COLOR_VARIABLES: readonly ColorVariable[] = [];
const EMPTY_CONTRAST_VARIABLES: readonly ContrastVariable[] = [];
const EMPTY_GROUPS: readonly string[] = [];
const EMPTY_MAPPINGS: readonly Mapping[] = [];

/**
 * Exposes Theme Palette Card state and dispatches user or lifecycle actions.
 */
export function useThemePaletteCardViewModel() {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(themeUiStore.api, (state) => state.state.selectedRef);
  const themeTemplateRef = useStore(themeUiStore.api, (state) => state.state.theme?.templateRef ?? null);
  const themeColorAssignments = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.theme?.colorAssignments ?? EMPTY_COLOR_ASSIGNMENTS),
  );
  const themeContrastAssignments = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.theme?.contrastAssignments ?? EMPTY_CONTRAST_ASSIGNMENTS),
  );
  const applyPaletteToDark = useStore(
    themeUiStore.api,
    (state) => state.state.theme?.applyPaletteToDark ?? true,
  );
  const applyPaletteToLight = useStore(
    themeUiStore.api,
    (state) => state.state.theme?.applyPaletteToLight ?? true,
  );
  const themePaletteClusterCountK = useStore(
    themeUiStore.api,
    (state) => state.state.theme?.paletteClusterCountK ?? 5,
  );
  const themeBackgroundTokenRef = useStore(
    themeUiStore.api,
    (state) => state.state.theme?.themeBackgroundTokenRef ?? null,
  );
  const hasTheme = useStore(themeUiStore.api, (state) => state.state.theme !== null);
  const checkedColorRefsArray = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.checkedColorRefs),
  );
  const checkedContrastRefsArray = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.checkedContrastRefs),
  );
  const hueAdjustment = useStore(themeUiStore.api, (state) => state.state.hueAdjustment);
  const hueReferenceHex = useStore(themeUiStore.api, (state) => state.state.hueReferenceHex);
  const previewClusterCountK = useStore(themeUiStore.api, (state) => state.state.previewClusterCountK);
  const loadedTemplate = useStore(themePreviewStore.api, (state) => state.state.loadedTemplateForTheme);
  const colorVariablesFromTemplate = useStore(
    themePreviewStore.api,
    useShallow((state) => state.state.loadedTemplateForTheme?.colorVariables ?? EMPTY_COLOR_VARIABLES),
  );
  const groupsFromTemplate = useStore(
    themePreviewStore.api,
    useShallow((state) => state.state.loadedTemplateForTheme?.groups ?? EMPTY_GROUPS),
  );
  const loadedTemplateContrastVariables = useStore(
    themePreviewStore.api,
    useShallow((state) => state.state.loadedTemplateForTheme?.contrastVariables ?? EMPTY_CONTRAST_VARIABLES),
  );
  const loadedTemplateMappings = useStore(
    themePreviewStore.api,
    useShallow((state) => state.state.loadedTemplateForTheme?.mappings ?? EMPTY_MAPPINGS),
  );
  const paneDisplayColorAssignments = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.paneDisplayColorAssignments),
  );
  const paneSelectedColorsDisplay = useStore(themeUiStore.api, (state) => state.state.paneSelectedColorsDisplay);
  const paletteClustersByGroup = useStore(themeUiStore.api, (state) => state.state.paletteClustersByGroup);
  const paletteClusterByDark = useStore(themeUiStore.api, (state) => state.state.paletteClusterByDark);
  const checkedColorRefs = useMemo(() => new Set<string>(checkedColorRefsArray), [checkedColorRefsArray]);

  const theme: Pick<Theme, 'templateRef'> | null = useMemo(
    () => (themeTemplateRef ? { templateRef: themeTemplateRef } : null),
    [themeTemplateRef],
  );

  const hueDragStartRef = useRef<{ theme: Theme; hueAdjustment: number } | null>(null);
  const pendingHueValueRef = useRef<number | null>(null);
  const hueFrameRef = useRef<number | null>(null);

  const lastSelectedRefForHueRef = useRef<{ name: string; version: string } | null>(null);
  useEffect(() => {
    if (!hasTheme || !loadedTemplate || !selectedRef || !themeTemplateRef) return;
    if (themeTemplateRef.name !== loadedTemplate.name || themeTemplateRef.version !== loadedTemplate.version)
      return;
    const currentKey = { name: selectedRef.name, version: selectedRef.version };
    const prev = lastSelectedRefForHueRef.current;
    if (prev && prev.name === currentKey.name && prev.version === currentKey.version) return;
    lastSelectedRefForHueRef.current = currentKey;
    const resolved = resolveColorForThemeTokenKey(
      themeBackgroundTokenRef,
      loadedTemplateMappings,
      themeColorAssignments,
      themeContrastAssignments,
      loadedTemplateContrastVariables,
      'dark',
      '#1e1e1e',
    );
    const normalized = resolved.startsWith('#') ? resolved : `#${resolved}`;
    void dispatch({ type: ThemePaletteCardActionType.HueReferenceCommit, value: normalized });
  }, [
    hasTheme,
    loadedTemplate,
    selectedRef,
    themeTemplateRef,
    themeBackgroundTokenRef,
    themeColorAssignments,
    themeContrastAssignments,
    loadedTemplateMappings,
    loadedTemplateContrastVariables,
    dispatch,
  ]);

  const clusterCountK = previewClusterCountK ?? themePaletteClusterCountK;

  useEffect(() => {
    if (!themeTemplateRef) return;
    void dispatch({ type: ThemePaletteCardActionType.RecomputeClusters });
  }, [
    themeColorAssignments,
    applyPaletteToDark,
    applyPaletteToLight,
    checkedColorRefsArray,
    colorVariablesFromTemplate,
    clusterCountK,
    paletteClusterByDark,
    themeTemplateRef,
    dispatch,
  ]);

  useEffect(() => () => {
    if (hueFrameRef.current !== null) {
      cancelAnimationFrame(hueFrameRef.current);
    }
  }, []);

  const setHueAdjustment = useCallback(
    (value: number) => {
      pendingHueValueRef.current = value;
      if (hueFrameRef.current !== null) return;

      hueFrameRef.current = requestAnimationFrame(() => {
        hueFrameRef.current = null;
        const nextValue = pendingHueValueRef.current;
        pendingHueValueRef.current = null;
        if (nextValue === null) return;
        void dispatch({ type: ThemePaletteCardActionType.HueSliderOnDelta, value: nextValue });
      });
    },
    [dispatch],
  );

  const commitHueAdjustment = useCallback(
    (value: number) => {
      if (hueFrameRef.current !== null) {
        cancelAnimationFrame(hueFrameRef.current);
        hueFrameRef.current = null;
      }
      const latestValue = pendingHueValueRef.current ?? value;
      pendingHueValueRef.current = null;
      void dispatch({ type: ThemePaletteCardActionType.HueSliderOnCommit, value: latestValue });
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
    const currentTheme = themeUiStore.getStore().state.theme;
    if (!currentTheme) return;
    hueDragStartRef.current = { theme: { ...currentTheme }, hueAdjustment };
  }, [hueAdjustment]);

  const endHueDrag = useCallback(
    (value: number) => {
      commitHueAdjustment(value);
      hueDragStartRef.current = null;
    },
    [commitHueAdjustment],
  );

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
      if (!themeUiStore.getStore().state.theme || refs.length === 0) return;
      void dispatch({
        type: ThemePaletteCardActionType.ColorRefsSelectionCommit,
        refs,
        checked,
      });
    },
    [dispatch],
  );

  const openColorPicker = useCallback((): ThemePaneState => {
    const currentTheme = themeUiStore.getStore().state.theme;
    return buildThemePaneSnapshot(
      currentTheme,
      checkedColorRefsArray,
      checkedContrastRefsArray,
      hueAdjustment,
      hueReferenceHex,
    );
  }, [checkedColorRefsArray, checkedContrastRefsArray, hueAdjustment, hueReferenceHex]);

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
    onHueCommit: commitHueAdjustment,
    onHueReferenceChange: setHueReferenceHex,
    onRecenter: recenterHue,
    onHueDragStart: startHueDrag,
    onHueDragEnd: endHueDrag,
    applyToDark: applyPaletteToDark,
    applyToLight: applyPaletteToLight,
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
