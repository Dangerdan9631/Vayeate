import { useCallback, useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import type { TokenKey } from '../../../model/schema/primitives';
import type { ColorAssignment, ContrastAssignment, Theme, ThemePreviewTokenRefField } from '../../../model/schema/theme-schemas';
import type { ContrastVariable, Mapping } from '../../../model/schema/template-schemas';
import type { TokenizedPreview } from '../../../model/preview-types';
import { ThemeUiStore } from '../../../domain/state/ui/theme-ui-store';
import { ThemePreviewStore } from '../../../domain/state/ui/theme-preview-store';
import { ThemeDetailsCardActionType } from '../theme-details-card/actions/theme-details-card-action-type';

const themeUiStore = container.resolve(ThemeUiStore);
const themePreviewStore = container.resolve(ThemePreviewStore);

const EMPTY_CONTRAST_ASSIGNMENTS: readonly ContrastAssignment[] = [];
const EMPTY_CONTRAST_VARIABLES: readonly ContrastVariable[] = [];
const EMPTY_MAPPINGS: readonly Mapping[] = [];

/**
 * Read model returned by useEditorPreviewsCardViewModel.
 */
export interface EditorPreviewsCardViewModel {
  theme: Pick<Theme, 'templateRef'> | null;
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

/**
 * Exposes Editor Previews Card state and dispatches user or lifecycle actions.
 * @returns View-model state and action callbacks for the component.
 */
export function useEditorPreviewsCardViewModel(): EditorPreviewsCardViewModel {
  const dispatch = useAppDispatch();
  const themeTemplateRef = useStore(themeUiStore.api, (state) => state.state.theme?.templateRef ?? null);
  const contrastAssignments = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.theme?.contrastAssignments ?? EMPTY_CONTRAST_ASSIGNMENTS),
  );
  const idePrimaryTokenRef = useStore(themeUiStore.api, (state) => state.state.theme?.idePrimaryTokenRef ?? null);
  const ideForegroundTokenRef = useStore(themeUiStore.api, (state) => state.state.theme?.ideForegroundTokenRef ?? null);
  const themeBackgroundTokenRef = useStore(themeUiStore.api, (state) => state.state.theme?.themeBackgroundTokenRef ?? null);
  const themeForegroundTokenRef = useStore(themeUiStore.api, (state) => state.state.theme?.themeForegroundTokenRef ?? null);
  const lineNumberBackgroundTokenRef = useStore(
    themeUiStore.api,
    (state) => state.state.theme?.lineNumberBackgroundTokenRef ?? null,
  );
  const lineNumberForegroundTokenRef = useStore(
    themeUiStore.api,
    (state) => state.state.theme?.lineNumberForegroundTokenRef ?? null,
  );
  const ideTabTokenRef = useStore(themeUiStore.api, (state) => state.state.theme?.ideTabTokenRef ?? null);
  const ideTabBarBackgroundTokenRef = useStore(
    themeUiStore.api,
    (state) => state.state.theme?.ideTabBarBackgroundTokenRef ?? null,
  );
  const ideTabBarForegroundTokenRef = useStore(
    themeUiStore.api,
    (state) => state.state.theme?.ideTabBarForegroundTokenRef ?? null,
  );
  const editorPreviewScrollbarBackgroundTokenRef = useStore(
    themeUiStore.api,
    (state) => state.state.theme?.editorPreviewScrollbarBackgroundTokenRef ?? null,
  );
  const editorPreviewScrollbarForegroundTokenRef = useStore(
    themeUiStore.api,
    (state) => state.state.theme?.editorPreviewScrollbarForegroundTokenRef ?? null,
  );
  const editorPreviewSelectionBackgroundTokenRef = useStore(
    themeUiStore.api,
    (state) => state.state.theme?.editorPreviewSelectionBackgroundTokenRef ?? null,
  );
  const editorPreviewMenuForegroundTokenRef = useStore(
    themeUiStore.api,
    (state) => state.state.theme?.editorPreviewMenuForegroundTokenRef ?? null,
  );
  const editorPreviewMenuBackgroundTokenRef = useStore(
    themeUiStore.api,
    (state) => state.state.theme?.editorPreviewMenuBackgroundTokenRef ?? null,
  );
  const editorPreviews = useStore(themePreviewStore.api, (state) => state.state.editorPreviews);
  const panePreviewColorAssignments = useStore(
    themeUiStore.api,
    useShallow((state) => state.state.panePreviewColorAssignments),
  );
  const templateMappings = useStore(
    themePreviewStore.api,
    useShallow((state) => state.state.loadedTemplateForTheme?.mappings ?? EMPTY_MAPPINGS),
  );
  const contrastVariablesFromTemplate = useStore(
    themePreviewStore.api,
    useShallow((state) => state.state.loadedTemplateForTheme?.contrastVariables ?? EMPTY_CONTRAST_VARIABLES),
  );

  const theme: Pick<Theme, 'templateRef'> | null = useMemo(
    () => (themeTemplateRef ? { templateRef: themeTemplateRef } : null),
    [themeTemplateRef],
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
    colorAssignments: panePreviewColorAssignments,
    contrastAssignments,
    contrastVariables: contrastVariablesFromTemplate,
    mappings: templateMappings,
    idePrimaryTokenRef,
    onChangeIdePrimaryTokenRef: changeIdePrimaryTokenRef,
    ideForegroundTokenRef,
    onChangeIdeForegroundTokenRef: changeIdeForegroundTokenRef,
    themeBackgroundTokenRef,
    onChangeThemeBackgroundTokenRef: changeThemeBackgroundTokenRef,
    themeForegroundTokenRef,
    onChangeThemeForegroundTokenRef: changeThemeForegroundTokenRef,
    lineNumberBackgroundTokenRef,
    onChangeLineNumberBackgroundTokenRef: changeLineNumberBackgroundTokenRef,
    lineNumberForegroundTokenRef,
    onChangeLineNumberForegroundTokenRef: changeLineNumberForegroundTokenRef,
    ideTabTokenRef,
    onChangeIdeTabTokenRef: changeIdeTabTokenRef,
    ideTabBarBackgroundTokenRef,
    onChangeIdeTabBarBackgroundTokenRef: changeIdeTabBarBackgroundTokenRef,
    ideTabBarForegroundTokenRef,
    onChangeIdeTabBarForegroundTokenRef: changeIdeTabBarForegroundTokenRef,
    editorPreviewScrollbarBackgroundTokenRef,
    onChangeEditorPreviewScrollbarBackgroundTokenRef: changeEditorPreviewScrollbarBackgroundTokenRef,
    editorPreviewScrollbarForegroundTokenRef,
    onChangeEditorPreviewScrollbarForegroundTokenRef: changeEditorPreviewScrollbarForegroundTokenRef,
    editorPreviewSelectionBackgroundTokenRef,
    onChangeEditorPreviewSelectionBackgroundTokenRef: changeEditorPreviewSelectionBackgroundTokenRef,
    editorPreviewMenuForegroundTokenRef,
    onChangeEditorPreviewMenuForegroundTokenRef: changeEditorPreviewMenuForegroundTokenRef,
    editorPreviewMenuBackgroundTokenRef,
    onChangeEditorPreviewMenuBackgroundTokenRef: changeEditorPreviewMenuBackgroundTokenRef,
  };
}
