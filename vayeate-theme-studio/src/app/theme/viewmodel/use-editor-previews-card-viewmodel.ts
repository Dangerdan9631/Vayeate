import { useCallback, useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/app-context';
import type { ThemePreviewTokenRefField, TokenKey } from '../../../model/schemas';
import { ThemeActionType } from '../actions/theme-action-type';
import { computeDisplayColorAssignments } from '../../../domain/utils/theme-pane-display';

export function useEditorPreviewsCardViewModel() {
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
    hueAdjustment,
    loadedTemplateForTheme: loadedTemplate,
    editorPreviews,
  } = themes;

  const checkedColorRefs = useMemo(() => new Set(checkedColorRefsArray), [checkedColorRefsArray]);
  const applyHueToDark = theme?.applyPaletteToDark ?? true;
  const applyHueToLight = theme?.applyPaletteToLight ?? true;

  const displayColorAssignments = useMemo(
    () =>
      computeDisplayColorAssignments(theme, hueAdjustment, checkedColorRefs, applyHueToDark, applyHueToLight),
    [theme, hueAdjustment, checkedColorRefs, applyHueToDark, applyHueToLight],
  );

  const templateMappings = useMemo(() => loadedTemplate?.mappings ?? [], [loadedTemplate]);
  const contrastVariablesFromTemplate = useMemo(
    () => loadedTemplate?.contrastVariables ?? [],
    [loadedTemplate],
  );

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

  return {
    theme,
    editorPreviews,
    colorAssignments: displayColorAssignments,
    contrastAssignments: theme?.contrastAssignments ?? [],
    contrastVariables: contrastVariablesFromTemplate,
    mappings: templateMappings,
    idePrimaryTokenRef: theme?.idePrimaryTokenRef ?? null,
    onChangeIdePrimaryTokenRef: changeIdePrimaryTokenRef,
    ideForegroundTokenRef: theme?.ideForegroundTokenRef ?? null,
    onChangeIdeForegroundTokenRef: changeIdeForegroundTokenRef,
    themeBackgroundTokenRef: theme?.themeBackgroundTokenRef ?? null,
    onChangeThemeBackgroundTokenRef: changeThemeBackgroundTokenRef,
    themeForegroundTokenRef: theme?.themeForegroundTokenRef ?? null,
    onChangeThemeForegroundTokenRef: changeThemeForegroundTokenRef,
    lineNumberBackgroundTokenRef: theme?.lineNumberBackgroundTokenRef ?? null,
    onChangeLineNumberBackgroundTokenRef: changeLineNumberBackgroundTokenRef,
    lineNumberForegroundTokenRef: theme?.lineNumberForegroundTokenRef ?? null,
    onChangeLineNumberForegroundTokenRef: changeLineNumberForegroundTokenRef,
    ideTabTokenRef: theme?.ideTabTokenRef ?? null,
    onChangeIdeTabTokenRef: changeIdeTabTokenRef,
    ideTabBarBackgroundTokenRef: theme?.ideTabBarBackgroundTokenRef ?? null,
    onChangeIdeTabBarBackgroundTokenRef: changeIdeTabBarBackgroundTokenRef,
    ideTabBarForegroundTokenRef: theme?.ideTabBarForegroundTokenRef ?? null,
    onChangeIdeTabBarForegroundTokenRef: changeIdeTabBarForegroundTokenRef,
    editorPreviewScrollbarBackgroundTokenRef: theme?.editorPreviewScrollbarBackgroundTokenRef ?? null,
    onChangeEditorPreviewScrollbarBackgroundTokenRef: changeEditorPreviewScrollbarBackgroundTokenRef,
    editorPreviewScrollbarForegroundTokenRef: theme?.editorPreviewScrollbarForegroundTokenRef ?? null,
    onChangeEditorPreviewScrollbarForegroundTokenRef: changeEditorPreviewScrollbarForegroundTokenRef,
    editorPreviewSelectionBackgroundTokenRef: theme?.editorPreviewSelectionBackgroundTokenRef ?? null,
    onChangeEditorPreviewSelectionBackgroundTokenRef: changeEditorPreviewSelectionBackgroundTokenRef,
    editorPreviewMenuForegroundTokenRef: theme?.editorPreviewMenuForegroundTokenRef ?? null,
    onChangeEditorPreviewMenuForegroundTokenRef: changeEditorPreviewMenuForegroundTokenRef,
    editorPreviewMenuBackgroundTokenRef: theme?.editorPreviewMenuBackgroundTokenRef ?? null,
    onChangeEditorPreviewMenuBackgroundTokenRef: changeEditorPreviewMenuBackgroundTokenRef,
  };
}
