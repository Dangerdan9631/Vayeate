import { useCallback, useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/app-context';
import { ThemeActionType } from '../actions/theme-action-type';
import type { ContrastAssignmentValue, ContrastComparisonMethod, ContrastValue } from '../../../model/schemas';
export function useThemeVariablesCardViewModel() {
  const dispatch = useAppDispatch();
  const themes = useContextSelector(AppContext, (c) => {
    const slice = c?.state.themes;
    if (slice === undefined) {
      throw new Error('Theme state requires AppProvider.');
    }
    return slice;
  });
  const {
    theme,
    checkedColorRefs: checkedColorRefsArray,
    checkedContrastRefs: checkedContrastRefsArray,
    themeVariablesSearchText,
    loadedTemplateForTheme: loadedTemplate,
    paneDisplayColorAssignments,
    orphanColorKeys: orphanColorKeysArray,
    orphanContrastKeys: orphanContrastKeysArray,
  } = themes;

  const checkedColorRefs = useMemo(() => new Set(checkedColorRefsArray), [checkedColorRefsArray]);
  const checkedContrastRefs = useMemo(() => new Set(checkedContrastRefsArray), [checkedContrastRefsArray]);

  const orphanColorKeys = useMemo(() => new Set(orphanColorKeysArray), [orphanColorKeysArray]);
  const orphanContrastKeys = useMemo(() => new Set(orphanContrastKeysArray), [orphanContrastKeysArray]);

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
        type: ThemeActionType.ThemeVariablesContrastUseDarkForLightCheckboxOnToggle,
        ref: contrastRef,
        checked: useDark,
      });
    },
    [dispatch],
  );

  const toggleColorChecked = useCallback(
    (ref: string) => {
      dispatch({
        type: ThemeActionType.ThemeVariablesVariableSelectionCheckboxOnToggle,
        ref,
        checked: !checkedColorRefs.has(ref),
      });
    },
    [dispatch, checkedColorRefs],
  );

  const toggleContrastChecked = useCallback(
    (ref: string) => {
      dispatch({
        type: ThemeActionType.ThemeVariablesVariableSelectionCheckboxOnToggle,
        ref,
        checked: !checkedContrastRefs.has(ref),
      });
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

  const setVariablesSearchText = useCallback(
    (value: string) => {
      dispatch({ type: ThemeActionType.ThemeVariablesSearchTextOnChange, value });
    },
    [dispatch],
  );

  const onColorDarkEyedropperClick = useCallback(
    (colorRef: string) => {
      void dispatch({
        type: ThemeActionType.ThemeVariablesColorDarkColorEyedropperButtonOnClick,
        ref: colorRef,
      });
    },
    [dispatch],
  );

  const onColorLightEyedropperClick = useCallback(
    (colorRef: string) => {
      void dispatch({
        type: ThemeActionType.ThemeVariablesColorLightColorEyedropperButtonOnClick,
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
