import { useCallback, useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../common/dispatch/use-app-dispatch';
import type { TokenKey } from '../../../model/schema/primitives';
import type { ColorAssignment, ContrastAssignment, Theme, ThemePreviewTokenRefField } from '../../../model/schema/theme-schemas';
import type { ContrastVariable, Mapping } from '../../../model/schema/template-schemas';
import type { TokenizedPreview } from '../../../model/preview-types';
import { ThemesStore } from '../../../domain/state/theme/themes-store';
import { ThemeDetailsCardActionType } from '../theme-details-card/actions/theme-details-card-action-type';

const themesStore = container.resolve(ThemesStore);

export interface EditorPreviewsCardViewModel {
  theme: Theme | null;
  editorPreviews: TokenizedPreview[];
  colorAssignments: readonly ColorAssignment[];
  contrastAssignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
  mappings: readonly Mapping[];
  idePrimaryTokenRef: TokenKey | null;
  onChangeIdePrimaryTokenRef: (tokenKey: TokenKey | null) => void;
  ideForegroundTokenRef: TokenKey | null;
  onChangeIdeForegroundTokenRef: (tokenKey: TokenKey | null) => void;
  themeBackgroundTokenRef: TokenKey | null;
  onChangeThemeBackgroundTokenRef: (tokenKey: TokenKey | null) => void;
  themeForegroundTokenRef: TokenKey | null;
  onChangeThemeForegroundTokenRef: (tokenKey: TokenKey | null) => void;
  lineNumberBackgroundTokenRef: TokenKey | null;
  onChangeLineNumberBackgroundTokenRef: (tokenKey: TokenKey | null) => void;
  lineNumberForegroundTokenRef: TokenKey | null;
  onChangeLineNumberForegroundTokenRef: (tokenKey: TokenKey | null) => void;
  ideTabTokenRef: TokenKey | null;
  onChangeIdeTabTokenRef: (tokenKey: TokenKey | null) => void;
  ideTabBarBackgroundTokenRef: TokenKey | null;
  onChangeIdeTabBarBackgroundTokenRef: (tokenKey: TokenKey | null) => void;
  ideTabBarForegroundTokenRef: TokenKey | null;
  onChangeIdeTabBarForegroundTokenRef: (tokenKey: TokenKey | null) => void;
  editorPreviewScrollbarBackgroundTokenRef: TokenKey | null;
  onChangeEditorPreviewScrollbarBackgroundTokenRef: (tokenKey: TokenKey | null) => void;
  editorPreviewScrollbarForegroundTokenRef: TokenKey | null;
  onChangeEditorPreviewScrollbarForegroundTokenRef: (tokenKey: TokenKey | null) => void;
  editorPreviewSelectionBackgroundTokenRef: TokenKey | null;
  onChangeEditorPreviewSelectionBackgroundTokenRef: (tokenKey: TokenKey | null) => void;
  editorPreviewMenuForegroundTokenRef: TokenKey | null;
  onChangeEditorPreviewMenuForegroundTokenRef: (tokenKey: TokenKey | null) => void;
  editorPreviewMenuBackgroundTokenRef: TokenKey | null;
  onChangeEditorPreviewMenuBackgroundTokenRef: (tokenKey: TokenKey | null) => void;
}

export function useEditorPreviewsCardViewModel(): EditorPreviewsCardViewModel {
  const dispatch = useAppDispatch();
  const theme = useStore(themesStore.api, (state) => state.state.theme);
  const loadedTemplate = useStore(themesStore.api, (state) => state.state.loadedTemplateForTheme);
  const editorPreviews = useStore(themesStore.api, (state) => state.state.editorPreviews);
  const paneDisplayColorAssignments = useStore(themesStore.api, (state) => state.state.paneDisplayColorAssignments);

  const templateMappings = useMemo(() => loadedTemplate?.mappings ?? [], [loadedTemplate]);
  const contrastVariablesFromTemplate = useMemo(
    () => loadedTemplate?.contrastVariables ?? [],
    [loadedTemplate],
  );

  const dispatchPreviewTokenRef = useCallback(
    (tokenRefField: ThemePreviewTokenRefField, value: TokenKey | null) => {
      void dispatch({ type: ThemeDetailsCardActionType.PreviewTokenRefListOnCommit, tokenRefField, value });
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
    colorAssignments: paneDisplayColorAssignments,
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

