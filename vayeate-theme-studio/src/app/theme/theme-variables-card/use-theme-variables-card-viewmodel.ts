import { useCallback, useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { ThemePreviewStore } from '../../../domain/state/ui/theme-preview-store';
import { ThemeUiStore } from '../../../domain/state/ui/theme-ui-store';
import { ThemeVariablesCardActionType } from './actions/theme-variables-card-action-type';
import type { ContrastComparisonMethod, ContrastValue } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable, StyleVariable } from '../../../model/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment, ContrastAssignmentValue, StyleAssignment, StyleAssignmentValue } from '../../../model/schema/theme-schemas';

const themeUiStore = container.resolve(ThemeUiStore);
const themePreviewStore = container.resolve(ThemePreviewStore);

const EMPTY_COLOR_VARIABLES: readonly ColorVariable[] = [];
const EMPTY_CONTRAST_VARIABLES: readonly ContrastVariable[] = [];
const EMPTY_STYLE_VARIABLES: readonly StyleVariable[] = [];
const EMPTY_COLOR_ASSIGNMENTS: readonly ColorAssignment[] = [];
const EMPTY_CONTRAST_ASSIGNMENTS: readonly ContrastAssignment[] = [];
const EMPTY_STYLE_ASSIGNMENTS: readonly StyleAssignment[] = [];

function matchesSearch(key: string, searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  return !q || key.toLowerCase().includes(q);
}

/**
 * Exposes Theme Variables Card state and dispatches user or lifecycle actions.
 */
export function useThemeVariablesCardViewModel() {
  const dispatch = useAppDispatch();
  const themeTemplateRef = useStore(themeUiStore.api, (state) => state.state.theme?.templateRef);
  const themeColorAssignments = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.theme?.colorAssignments ?? EMPTY_COLOR_ASSIGNMENTS),
  );
  const themeContrastAssignments = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.theme?.contrastAssignments ?? EMPTY_CONTRAST_ASSIGNMENTS),
  );
  const themeStyleAssignments = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.theme?.styleAssignments ?? EMPTY_STYLE_ASSIGNMENTS),
  );
  const checkedColorRefsArray = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.checkedColorRefs),
  );
  const checkedContrastRefsArray = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.checkedContrastRefs),
  );
  const themeVariablesSearchText = useStore(themeUiStore.api, (state) => state.state.themeVariablesSearchText);
  const colorVariablesFromTemplate = useStore(
    themePreviewStore.api,
    useShallow((state) => state.state.loadedTemplateForTheme?.colorVariables ?? EMPTY_COLOR_VARIABLES),
  );
  const contrastVariablesFromTemplate = useStore(
    themePreviewStore.api,
    useShallow((state) => state.state.loadedTemplateForTheme?.contrastVariables ?? EMPTY_CONTRAST_VARIABLES),
  );
  const styleVariablesFromTemplate = useStore(
    themePreviewStore.api,
    useShallow((state) => state.state.loadedTemplateForTheme?.styleVariables ?? EMPTY_STYLE_VARIABLES),
  );
  const paneDisplayColorAssignments = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.paneDisplayColorAssignments),
  );
  const orphanColorKeysArray = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.orphanColorKeys),
  );
  const orphanContrastKeysArray = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.orphanContrastKeys),
  );
  const checkedColorRefs = useMemo(() => new Set<string>(checkedColorRefsArray), [checkedColorRefsArray]);
  const checkedContrastRefs = useMemo(() => new Set<string>(checkedContrastRefsArray), [checkedContrastRefsArray]);
  const orphanColorKeys = useMemo(() => new Set<string>(orphanColorKeysArray), [orphanColorKeysArray]);
  const orphanContrastKeys = useMemo(() => new Set<string>(orphanContrastKeysArray), [orphanContrastKeysArray]);

  const filteredColorAssignments = useMemo(
    () => paneDisplayColorAssignments
      .filter((a: ColorAssignment) => matchesSearch(a.colorRef, themeVariablesSearchText))
      .sort((a: ColorAssignment, b: ColorAssignment) => a.colorRef.localeCompare(b.colorRef)),
    [paneDisplayColorAssignments, themeVariablesSearchText],
  );

  const filteredContrastAssignments = useMemo(
    () => themeContrastAssignments
      .filter((a: ContrastAssignment) => matchesSearch(a.contrastVariableRef, themeVariablesSearchText))
      .sort((a: ContrastAssignment, b: ContrastAssignment) =>
        a.contrastVariableRef.localeCompare(b.contrastVariableRef)),
    [themeContrastAssignments, themeVariablesSearchText],
  );

  const filteredStyleAssignments = useMemo(
    () => themeStyleAssignments
      .filter((a: StyleAssignment) => matchesSearch(a.styleVariableRef, themeVariablesSearchText))
      .sort((a: StyleAssignment, b: StyleAssignment) =>
        a.styleVariableRef.localeCompare(b.styleVariableRef)),
    [themeStyleAssignments, themeVariablesSearchText],
  );

  const colorSectionState = useMemo(() => {
    if (!themeColorAssignments.length) return 'all' as const;
    const refs = themeColorAssignments.map((a: ColorAssignment) => a.colorRef);
    const all = refs.every((r: string) => checkedColorRefs.has(r));
    const none = refs.every((r: string) => !checkedColorRefs.has(r));
    if (all) return 'all' as const;
    if (none) return 'none' as const;
    return 'some' as const;
  }, [themeColorAssignments, checkedColorRefs]);

  const contrastSectionState = useMemo(() => {
    if (!themeContrastAssignments.length) return 'all' as const;
    const refs = themeContrastAssignments.map((a: ContrastAssignment) => a.contrastVariableRef);
    const all = refs.every((r: string) => checkedContrastRefs.has(r));
    const none = refs.every((r: string) => !checkedContrastRefs.has(r));
    if (all) return 'all' as const;
    if (none) return 'none' as const;
    return 'some' as const;
  }, [themeContrastAssignments, checkedContrastRefs]);

  const cardState = useMemo(() => {
    const colorAll = colorSectionState === 'all';
    const colorNone = colorSectionState === 'none';
    const contrastAll = contrastSectionState === 'all';
    const contrastNone = contrastSectionState === 'none';
    if (colorAll && contrastAll) return 'all' as const;
    if (colorNone && contrastNone) return 'none' as const;
    return 'some' as const;
  }, [colorSectionState, contrastSectionState]);

  const updateColorAssignmentDark = useCallback(
    (colorRef: string, value: string | null) => {
      void dispatch({
        type: ThemeVariablesCardActionType.ColorDarkTextOnCommit,
        ref: colorRef,
        value: value ?? '',
      });
    },
    [dispatch],
  );

  const updateColorAssignmentLight = useCallback(
    (colorRef: string, value: string | null) => {
      void dispatch({
        type: ThemeVariablesCardActionType.ColorLightTextOnCommit,
        ref: colorRef,
        value: value ?? '',
      });
    },
    [dispatch],
  );

  const updateColorAssignmentUseDarkForLight = useCallback(
    (colorRef: string, useDark: boolean) => {
      void dispatch({
        type: ThemeVariablesCardActionType.ColorUseDarkForLightCheckboxOnToggle,
        ref: colorRef,
        checked: useDark,
      });
    },
    [dispatch],
  );

  const updateContrastAssignmentDark = useCallback(
    (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => {
      if (field === 'value') {
        void dispatch({
          type: ThemeVariablesCardActionType.ContrastDarkValueTextOnCommit,
          ref: contrastRef,
          value: value as ContrastValue,
        });
      } else if (field === 'comparisonMethod') {
        void dispatch({
          type: ThemeVariablesCardActionType.ContrastDarkMethodListOnCommit,
          ref: contrastRef,
          value: value as ContrastComparisonMethod,
        });
      } else if (field === 'min') {
        void dispatch({
          type: ThemeVariablesCardActionType.ContrastDarkMinTextOnCommit,
          ref: contrastRef,
          value: value != null ? String(value) : '',
        });
      } else if (field === 'max') {
        void dispatch({
          type: ThemeVariablesCardActionType.ContrastDarkMaxTextOnCommit,
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
        void dispatch({
          type: ThemeVariablesCardActionType.ContrastLightValueTextOnCommit,
          ref: contrastRef,
          value: value as ContrastValue,
        });
      } else if (field === 'comparisonMethod') {
        void dispatch({
          type: ThemeVariablesCardActionType.ContrastLightMethodListOnCommit,
          ref: contrastRef,
          value: value as ContrastComparisonMethod,
        });
      } else if (field === 'min') {
        void dispatch({
          type: ThemeVariablesCardActionType.ContrastLightMinTextOnCommit,
          ref: contrastRef,
          value: value != null ? String(value) : '',
        });
      } else if (field === 'max') {
        void dispatch({
          type: ThemeVariablesCardActionType.ContrastLightMaxTextOnCommit,
          ref: contrastRef,
          value: value != null ? String(value) : '',
        });
      }
    },
    [dispatch],
  );

  const updateContrastAssignmentUseDarkForLight = useCallback(
    (contrastRef: string, useDark: boolean) => {
      void dispatch({
        type: ThemeVariablesCardActionType.ContrastUseDarkForLightCheckboxOnToggle,
        ref: contrastRef,
        checked: useDark,
      });
    },
    [dispatch],
  );

  const updateStyleAssignmentField = useCallback(
    (styleRef: string, side: 'light' | 'dark', field: keyof StyleAssignmentValue, checked: boolean) => {
      void dispatch({
        type: ThemeVariablesCardActionType.StyleFieldCheckboxOnToggle,
        ref: styleRef,
        side,
        field,
        checked,
      });
    },
    [dispatch],
  );

  const updateStyleAssignmentUseDarkForLight = useCallback(
    (styleRef: string, useDark: boolean) => {
      void dispatch({
        type: ThemeVariablesCardActionType.StyleUseDarkForLightCheckboxOnToggle,
        ref: styleRef,
        checked: useDark,
      });
    },
    [dispatch],
  );

  const toggleColorChecked = useCallback(
    (ref: string) => {
      const { checkedColorRefs } = themeUiStore.getStore().state;
      const isChecked = checkedColorRefs.includes(ref);
      void dispatch({
        type: ThemeVariablesCardActionType.VariableSelectionCheckboxOnToggle,
        ref,
        checked: !isChecked,
      });
    },
    [dispatch],
  );

  const toggleContrastChecked = useCallback(
    (ref: string) => {
      const { checkedContrastRefs } = themeUiStore.getStore().state;
      const isChecked = checkedContrastRefs.includes(ref);
      void dispatch({
        type: ThemeVariablesCardActionType.VariableSelectionCheckboxOnToggle,
        ref,
        checked: !isChecked,
      });
    },
    [dispatch],
  );

  const setAllColorChecked = useCallback(
    (checked: boolean) => {
      void dispatch({
        type: ThemeVariablesCardActionType.SelectVariableTypeCheckboxOnToggle,
        variableType: 'color',
        checked,
      });
    },
    [dispatch],
  );

  const setAllContrastChecked = useCallback(
    (checked: boolean) => {
      void dispatch({
        type: ThemeVariablesCardActionType.SelectVariableTypeCheckboxOnToggle,
        variableType: 'contrast',
        checked,
      });
    },
    [dispatch],
  );

  const setAllVariablesChecked = useCallback(
    (checked: boolean) => {
      void dispatch({ type: ThemeVariablesCardActionType.SelectAllCheckboxOnToggle, checked });
    },
    [dispatch],
  );

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

  const setContrastGroupChecked = useCallback(
    (groupKey: string, checked: boolean) => {
      void dispatch({
        type: ThemeVariablesCardActionType.SelectVariableGroupCheckboxOnToggle,
        groupId: groupKey,
        checked,
      });
    },
    [dispatch],
  );

  const setVariablesSearchText = useCallback(
    (value: string) => {
      void dispatch({ type: ThemeVariablesCardActionType.SearchTextOnChange, value });
    },
    [dispatch],
  );

  const onColorDarkEyedropperClick = useCallback(
    (colorRef: string) => {
      void dispatch({
        type: ThemeVariablesCardActionType.ColorDarkColorEyedropperButtonOnClick,
        ref: colorRef,
      });
    },
    [dispatch],
  );

  const onColorLightEyedropperClick = useCallback(
    (colorRef: string) => {
      void dispatch({
        type: ThemeVariablesCardActionType.ColorLightColorEyedropperButtonOnClick,
        ref: colorRef,
      });
    },
    [dispatch],
  );

  return {
    themeTemplateRef,
    colorAssignments: filteredColorAssignments,
    contrastAssignments: filteredContrastAssignments,
    styleAssignments: filteredStyleAssignments,
    colorVariables: colorVariablesFromTemplate,
    contrastVariables: contrastVariablesFromTemplate,
    styleVariables: styleVariablesFromTemplate,
    orphanColorKeys,
    orphanContrastKeys,
    checkedColorRefs: checkedColorRefs as ReadonlySet<string>,
    checkedContrastRefs: checkedContrastRefs as ReadonlySet<string>,
    searchValue: themeVariablesSearchText,
    onSearchChange: setVariablesSearchText,
    onToggleColorChecked: toggleColorChecked,
    onToggleContrastChecked: toggleContrastChecked,
    onSetAllColorChecked: setAllColorChecked,
    onSetAllContrastChecked: setAllContrastChecked,
    onSetAllVariablesChecked: setAllVariablesChecked,
    onSetColorGroupChecked: setColorGroupChecked,
    onSetContrastGroupChecked: setContrastGroupChecked,
    colorSectionState,
    contrastSectionState,
    cardState,
    onUpdateColorDark: updateColorAssignmentDark,
    onUpdateColorLight: updateColorAssignmentLight,
    onUpdateColorUseDark: updateColorAssignmentUseDarkForLight,
    onUpdateContrastDark: updateContrastAssignmentDark,
    onUpdateContrastLight: updateContrastAssignmentLight,
    onUpdateContrastUseDark: updateContrastAssignmentUseDarkForLight,
    onUpdateStyleField: updateStyleAssignmentField,
    onUpdateStyleUseDark: updateStyleAssignmentUseDarkForLight,
    onColorDarkEyedropperClick,
    onColorLightEyedropperClick,
  };
}
