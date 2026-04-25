import { useCallback, useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../common/dispatch/use-app-dispatch';
import { ThemesStore } from '../../../domain/state/theme/themes-store';
import { ThemeVariablesCardActionType } from './actions/theme-variables-card-action-type';
import type { ContrastComparisonMethod, ContrastValue } from '../../../model/schema/primitives';
import type { ColorAssignment, ContrastAssignment, ContrastAssignmentValue } from '../../../model/schema/theme-schemas';

const themesStore = container.resolve(ThemesStore);

export function useThemeVariablesCardViewModel() {
  const dispatch = useAppDispatch();
  const theme = useStore(themesStore.api, (state) => state.state.theme);
  const checkedColorRefsArray = useStore(themesStore.api, (state) => state.state.checkedColorRefs);
  const checkedContrastRefsArray = useStore(themesStore.api, (state) => state.state.checkedContrastRefs);
  const themeVariablesSearchText = useStore(themesStore.api, (state) => state.state.themeVariablesSearchText);
  const loadedTemplate = useStore(themesStore.api, (state) => state.state.loadedTemplateForTheme);
  const paneDisplayColorAssignments = useStore(themesStore.api, (state) => state.state.paneDisplayColorAssignments);
  const orphanColorKeysArray = useStore(themesStore.api, (state) => state.state.orphanColorKeys);
  const orphanContrastKeysArray = useStore(themesStore.api, (state) => state.state.orphanContrastKeys);
  const checkedColorRefs = useMemo(() => new Set<string>(checkedColorRefsArray), [checkedColorRefsArray]);
  const checkedContrastRefs = useMemo(() => new Set<string>(checkedContrastRefsArray), [checkedContrastRefsArray]);
  const orphanColorKeys = useMemo(() => new Set<string>(orphanColorKeysArray), [orphanColorKeysArray]);
  const orphanContrastKeys = useMemo(() => new Set<string>(orphanContrastKeysArray), [orphanContrastKeysArray]);

  const colorVariablesFromTemplate = useMemo(
    () => loadedTemplate?.colorVariables ?? [],
    [loadedTemplate],
  );

  const contrastVariablesFromTemplate = useMemo(
    () => loadedTemplate?.contrastVariables ?? [],
    [loadedTemplate],
  );

  const groupsFromTemplate = useMemo(() => loadedTemplate?.groups ?? [], [loadedTemplate]);

  const colorSectionState = useMemo(() => {
    if (!theme?.colorAssignments.length) return 'all' as const;
    const refs = theme.colorAssignments.map((a: ColorAssignment) => a.colorRef);
    const all = refs.every((r: string) => checkedColorRefs.has(r));
    const none = refs.every((r: string) => !checkedColorRefs.has(r));
    if (all) return 'all' as const;
    if (none) return 'none' as const;
    return 'some' as const;
  }, [theme, checkedColorRefs]);

  const contrastSectionState = useMemo(() => {
    if (!theme?.contrastAssignments.length) return 'all' as const;
    const refs = theme.contrastAssignments.map((a: ContrastAssignment) => a.contrastVariableRef);
    const all = refs.every((r: string) => checkedContrastRefs.has(r));
    const none = refs.every((r: string) => !checkedContrastRefs.has(r));
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

  const toggleColorChecked = useCallback(
    (ref: string) => {
      void dispatch({
        type: ThemeVariablesCardActionType.VariableSelectionCheckboxOnToggle,
        ref,
        checked: !checkedColorRefs.has(ref),
      });
    },
    [dispatch, checkedColorRefs],
  );

  const toggleContrastChecked = useCallback(
    (ref: string) => {
      void dispatch({
        type: ThemeVariablesCardActionType.VariableSelectionCheckboxOnToggle,
        ref,
        checked: !checkedContrastRefs.has(ref),
      });
    },
    [dispatch, checkedContrastRefs],
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
    theme,
    colorAssignments: paneDisplayColorAssignments,
    contrastAssignments: theme?.contrastAssignments ?? [],
    colorVariables: colorVariablesFromTemplate,
    contrastVariables: contrastVariablesFromTemplate,
    groups: groupsFromTemplate,
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
    onColorDarkEyedropperClick,
    onColorLightEyedropperClick,
  };
}

