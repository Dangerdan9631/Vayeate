import type { Theme } from '../model/schemas';
import { compareVersions } from '../utils/version';
import { themeService } from '../services/theme-service';
import {
  loadThemeRefs as loadThemeRefsOp,
  loadTheme,
  setSelectedThemeRef,
  setTheme,
  setThemePaneSelections as setThemePaneSelectionsOp,
  setThemeHueAdjustment as setThemeHueAdjustmentOp,
  setThemeHueReferenceHex as setThemeHueReferenceHexOp,
  setThemeSaveError,
  setGenerateResult,
  saveTheme as saveThemeOp,
  deleteTheme as deleteThemeOp,
  createTheme as createThemeOperation,
  type SetState,
  type RestoreThemeStateParams,
} from '../operations/theme-operations';

const SAVE_THEME_DEBOUNCE_MS = 400;

let saveThemeTimeoutId: ReturnType<typeof setTimeout> | null = null;
let pendingThemeToSave: Theme | null = null;

export interface CreateThemeParams {
  name: string;
}

export function createThemeWithParams(params: CreateThemeParams): Theme {
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

export async function loadThemeRefs(setState: SetState): Promise<void> {
  await loadThemeRefsOp(setState);
}

export async function selectThemeAndLoad(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  setSelectedThemeRef(setState, { name, version });
  await loadTheme(setState, name, version);
}

export function openThemeCreateDialog(setState: SetState): void {
  setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: true });
}

export function closeThemeCreateDialog(setState: SetState): void {
  setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: false });
}

export async function createTheme(
  setState: SetState,
  params: { name: string },
): Promise<void> {
  setState({ type: 'SET_THEME_IS_CREATING', value: true });
  setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: false });
  try {
    const newTheme = await createThemeOperation(setState, params);
    await loadThemeRefsOp(setState);
    setTheme(setState, newTheme);
    setSelectedThemeRef(setState, { name: newTheme.name, version: newTheme.version });
    setThemePaneSelectionsOp(
      setState,
      newTheme.colorAssignments.map((a) => a.colorRef),
      newTheme.contrastAssignments.map((a) => a.contrastVariableRef),
    );
  } finally {
    setState({ type: 'SET_THEME_IS_CREATING', value: false });
  }
}

export function saveTheme(setState: SetState, theme: Theme): void {
  setTheme(setState, theme, true);
  setThemeSaveError(setState, null);
  pendingThemeToSave = theme;
  if (saveThemeTimeoutId !== null) clearTimeout(saveThemeTimeoutId);
  saveThemeTimeoutId = setTimeout(() => {
    saveThemeTimeoutId = null;
    const toSave = pendingThemeToSave;
    pendingThemeToSave = null;
    if (toSave) {
      saveThemeOp(toSave).catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        setThemeSaveError(setState, message);
      });
    }
  }, SAVE_THEME_DEBOUNCE_MS);
}

export function setThemePaneSelections(
  setState: SetState,
  checkedColorRefs: string[],
  checkedContrastRefs: string[],
): void {
  setThemePaneSelectionsOp(setState, checkedColorRefs, checkedContrastRefs);
}

export async function restoreThemeState(
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
  if (params.theme !== undefined) {
    setTheme(setState, params.theme);
  }
  if (
    params.checkedColorRefs !== undefined &&
    params.checkedContrastRefs !== undefined
  ) {
    setThemePaneSelectionsOp(setState, params.checkedColorRefs, params.checkedContrastRefs);
  }
  if (params.theme !== undefined && params.theme !== null) {
    setSelectedThemeRef(setState, {
      name: params.theme.name,
      version: params.theme.version,
    });
  }
  if (params.hueAdjustment !== undefined) {
    setThemeHueAdjustmentOp(setState, params.hueAdjustment);
  }
  if (params.hueReferenceHex !== undefined) {
    setThemeHueReferenceHexOp(setState, params.hueReferenceHex);
  }
  if (params.theme !== undefined && params.theme !== null) {
    setThemeSaveError(setState, null);
    try {
      await saveThemeOp(params.theme);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setThemeSaveError(setState, message);
    }
    await loadThemeRefsOp(setState);
  }
  if (params.deleteThemeVersionOnRestore) {
    await deleteThemeOp(
      params.deleteThemeVersionOnRestore.name,
      params.deleteThemeVersionOnRestore.version,
    );
    await loadThemeRefsOp(setState);
  }
}

export function setThemeHueAdjustment(setState: SetState, value: number): void {
  setThemeHueAdjustmentOp(setState, value);
}

export function setThemeHueReferenceHex(setState: SetState, value: string): void {
  setThemeHueReferenceHexOp(setState, value);
}

export async function deleteThemeVersion(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  await deleteThemeOp(name, version);
  const refs = await loadThemeRefsOp(setState);

  const sameThName = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));
  const lowerTh = sameThName.filter((r) => compareVersions(r.version, version) < 0);
  const higherTh = sameThName.filter((r) => compareVersions(r.version, version) > 0);
  const nextTh =
    lowerTh.length > 0 ? lowerTh[lowerTh.length - 1] : higherTh.length > 0 ? higherTh[0] : null;

  if (nextTh) {
    setSelectedThemeRef(setState, nextTh);
    const loadedNextTh = await loadTheme(setState, nextTh.name, nextTh.version);
    if (loadedNextTh) {
      setThemePaneSelectionsOp(
        setState,
        loadedNextTh.colorAssignments.map((a) => a.colorRef),
        loadedNextTh.contrastAssignments.map((a) => a.contrastVariableRef),
      );
    }
  } else {
    setSelectedThemeRef(setState, null);
    setTheme(setState, null);
    setThemePaneSelectionsOp(setState, [], []);
  }
}

export function clearThemeSaveError(setState: SetState): void {
  setThemeSaveError(setState, null);
}

export async function generateTheme(
  setState: SetState,
  themeName: string,
  themeVersion: string,
  templateName: string,
  templateVersion: string,
): Promise<void> {
  setGenerateResult(setState, null);
  try {
    const { darkPath, lightPath } = await themeService.generateTheme(
      themeName,
      themeVersion,
      templateName,
      templateVersion,
    );
    setGenerateResult(setState, {
      success: true,
      message: `Generated ${darkPath} and ${lightPath}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setGenerateResult(setState, { success: false, message });
  }
}
