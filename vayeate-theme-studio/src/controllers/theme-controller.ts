import type { Theme } from '../model/schemas';
import {
  loadThemeRefs,
  loadTheme,
  setSelectedThemeRef,
  setTheme,
  setThemePaneSelections,
  setThemeHueAdjustment,
  setThemeHueReferenceHex,
  setThemeSaveError,
  refreshThemeRefsOnly,
  persistTheme,
  deleteThemeVersion,
  restoreThemeState,
  generateTheme,
  createTheme as createThemeOperation,
  type SetState,
  type RestoreThemeStateParams,
} from '../operations/theme-operations';
import { createLogger } from '../utils/logger';

const log = createLogger('ThemeController');

const SAVE_THEME_DEBOUNCE_MS = 400;

let saveThemeTimeoutId: ReturnType<typeof setTimeout> | null = null;
let pendingThemeToSave: Theme | null = null;

export interface CreateThemeParams {
  name: string;
}

export function createThemeWithParams(params: CreateThemeParams): Theme {
  log.debug('createThemeWithParams', params.name);
  return {
    name: params.name,
    version: '1.0.0',
    templateRef: null,
    idePrimaryTokenRef: null,
    ideForegroundTokenRef: null,
    themeBackgroundTokenRef: null,
    themeForegroundTokenRef: null,
    lineNumberBackgroundTokenRef: null,
    lineNumberForegroundTokenRef: null,
    ideTabTokenRef: null,
    ideTabBarBackgroundTokenRef: null,
    ideTabBarForegroundTokenRef: null,
    editorPreviewScrollbarBackgroundTokenRef: null,
    editorPreviewScrollbarForegroundTokenRef: null,
    editorPreviewSelectionBackgroundTokenRef: null,
    editorPreviewMenuForegroundTokenRef: null,
    editorPreviewMenuBackgroundTokenRef: null,
    colorAssignments: [],
    contrastAssignments: [],
  };
}

export async function handleThemePageOnLoad(setState: SetState): Promise<void> {
  log.debug('handleThemePageOnLoad');
  await loadThemeRefs(setState);
}

export async function handleThemeListOnSelect(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  log.debug('handleThemeListOnSelect', name, `v${version}`);
  setSelectedThemeRef(setState, { name, version });
  await loadTheme(setState, name, version);
}

export function handleCreateDialogOnOpen(setState: SetState): void {
  setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: true });
}

export function handleCreateDialogOnClose(setState: SetState): void {
  setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: false });
}

export async function handleCreateFormOnSubmit(
  setState: SetState,
  params: { name: string },
): Promise<void> {
  log.debug('handleCreateFormOnSubmit', params);
  setState({ type: 'SET_THEME_IS_CREATING', value: true });
  setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: false });
  try {
    const newTheme = await createThemeOperation(setState, params);
    await refreshThemeRefsOnly(setState);
    setTheme(setState, newTheme);
    setSelectedThemeRef(setState, { name: newTheme.name, version: newTheme.version });
    setThemePaneSelections(
      setState,
      newTheme.colorAssignments.map((a) => a.colorRef),
      newTheme.contrastAssignments.map((a) => a.contrastVariableRef),
    );
  } finally {
    setState({ type: 'SET_THEME_IS_CREATING', value: false });
  }
}

export function handleSaveButtonOnClick(setState: SetState, theme: Theme): void {
  log.debug('handleSaveButtonOnClick', theme.name, theme.version);
  setTheme(setState, theme, true);
  setThemeSaveError(setState, null);
  pendingThemeToSave = theme;
  if (saveThemeTimeoutId !== null) clearTimeout(saveThemeTimeoutId);
  saveThemeTimeoutId = setTimeout(() => {
    saveThemeTimeoutId = null;
    const toSave = pendingThemeToSave;
    pendingThemeToSave = null;
    if (toSave) {
      persistTheme(setState, toSave).catch((err) =>
        log.error('handleSaveButtonOnClick persist failed', err),
      );
    }
  }, SAVE_THEME_DEBOUNCE_MS);
}

export function handleThemePaneOnSelect(
  setState: SetState,
  checkedColorRefs: string[],
  checkedContrastRefs: string[],
): void {
  setThemePaneSelections(setState, checkedColorRefs, checkedContrastRefs);
}

export async function handleUndoPanelRestoreTheme(
  setState: SetState,
  params: RestoreThemeStateParams,
): Promise<void> {
  if (params.theme !== undefined && params.theme !== null) {
    if (saveThemeTimeoutId !== null) {
      clearTimeout(saveThemeTimeoutId);
      saveThemeTimeoutId = null;
    }
    pendingThemeToSave = null;
  }
  await restoreThemeState(setState, params);
}

export function handleHueAdjustmentSliderOnDelta(setState: SetState, value: number): void {
  setThemeHueAdjustment(setState, value);
}

export function handleHueReferenceInputOnChange(setState: SetState, value: string): void {
  setThemeHueReferenceHex(setState, value);
}

export async function handleVersionDeleteButtonOnClick(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  await deleteThemeVersion(setState, name, version);
}

export function handleSaveErrorDialogOnClose(setState: SetState): void {
  setThemeSaveError(setState, null);
}

export async function handleGenerateButtonOnClick(
  setState: SetState,
  themeName: string,
  themeVersion: string,
  templateName: string,
  templateVersion: string,
): Promise<void> {
  await generateTheme(setState, themeName, themeVersion, templateName, templateVersion);
}
