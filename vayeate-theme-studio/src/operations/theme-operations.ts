import type { Theme, ThemeReference } from '../model/schemas';
import type { AppStateUpdate } from '../state/app-state';
import { themeService } from '../services/theme-service';
import { compareVersions } from '../utils/version';
import { createLogger } from '../utils/logger';

const log = createLogger('ThemeOperations');

export type SetState = (update: AppStateUpdate) => void;

export function setThemeRefs(setState: SetState, refs: ThemeReference[]): void {
  setState({ type: 'SET_THEME_REFS', refs });
}

export function setSelectedThemeRef(setState: SetState, ref: ThemeReference | null): void {
  setState({ type: 'SET_SELECTED_THEME_REF', ref });
}

export function setTheme(
  setState: SetState,
  theme: Theme | null,
  preserveHue?: boolean,
): void {
  setState({ type: 'SET_THEME', theme, preserveHue });
}

export function setThemePaneSelections(
  setState: SetState,
  checkedColorRefs: string[],
  checkedContrastRefs: string[],
): void {
  setState({
    type: 'SET_THEME_PANE_SELECTIONS',
    checkedColorRefs,
    checkedContrastRefs,
  });
}

export function setThemeHueAdjustment(setState: SetState, value: number): void {
  setState({ type: 'SET_THEME_HUE_ADJUSTMENT', value });
}

export function setThemeHueReferenceHex(setState: SetState, value: string): void {
  setState({ type: 'SET_THEME_HUE_REFERENCE_HEX', value });
}

export function setThemeSaveError(setState: SetState, error: string | null): void {
  setState({ type: 'SET_THEME_SAVE_ERROR', error });
}

export function setGenerateResult(
  setState: SetState,
  result: { success: boolean; message: string } | null,
): void {
  setState({ type: 'SET_GENERATE_RESULT', result });
}

export async function loadThemeRefs(setState: SetState): Promise<ThemeReference[]> {
  const refs = await themeService.listThemes();
  log.debug('loaded', refs.length, 'theme ref(s)');
  setState({ type: 'SET_THEME_REFS', refs });
  return refs;
}

export async function createTheme(
  _setState: SetState,
  params: { name: string },
): Promise<Theme> {
  const theme = await themeService.createTheme(params);
  log.debug('created theme', theme.name, `v${theme.version}`);
  return theme;
}

export async function loadTheme(
  setState: SetState,
  name: string,
  version: string,
): Promise<Theme | null> {
  const loaded = await themeService.loadTheme(name, version);
  log.debug(
    'loaded theme',
    loaded
      ? `${loaded.colorAssignments.length} color, ${loaded.contrastAssignments.length} contrast`
      : '(not found)',
  );
  setState({ type: 'SET_THEME', theme: loaded });
  if (loaded) {
    setThemePaneSelections(
      setState,
      loaded.colorAssignments.map((a) => a.colorRef),
      loaded.contrastAssignments.map((a) => a.contrastVariableRef),
    );
  }
  return loaded;
}

export async function refreshThemeRefsOnly(setState: SetState): Promise<ThemeReference[]> {
  log.debug('refreshThemeRefsOnly');
  return loadThemeRefs(setState);
}

export async function persistTheme(setState: SetState, theme: Theme): Promise<void> {
  try {
    await themeService.saveTheme(theme);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setThemeSaveError(setState, message);
  }
}

export async function deleteThemeVersion(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  log.debug('deleteThemeVersion', name, `v${version}`);
  await themeService.deleteTheme(name, version);
  const refs = await themeService.listThemes();
  setState({ type: 'SET_THEME_REFS', refs });

  const sameThName = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));

  const lowerTh = sameThName.filter((r) => compareVersions(r.version, version) < 0);
  const higherTh = sameThName.filter((r) => compareVersions(r.version, version) > 0);
  const nextTh =
    lowerTh.length > 0 ? lowerTh[lowerTh.length - 1] : higherTh.length > 0 ? higherTh[0] : null;

  if (nextTh) {
    log.debug('deleteThemeVersion fallback to', nextTh.name, `v${nextTh.version}`);
    setState({ type: 'SET_SELECTED_THEME_REF', ref: nextTh });
    const loadedNextTh = await themeService.loadTheme(nextTh.name, nextTh.version);
    setState({ type: 'SET_THEME', theme: loadedNextTh });
    if (loadedNextTh) {
      setThemePaneSelections(
        setState,
        loadedNextTh.colorAssignments.map((a) => a.colorRef),
        loadedNextTh.contrastAssignments.map((a) => a.contrastVariableRef),
      );
    }
  } else {
    log.debug('deleteThemeVersion no remaining versions, clearing selection');
    setState({ type: 'SET_SELECTED_THEME_REF', ref: null });
    setState({ type: 'SET_THEME', theme: null });
    setThemePaneSelections(setState, [], []);
  }
}

export interface RestoreThemeStateParams {
  theme?: Theme | null;
  checkedColorRefs?: string[];
  checkedContrastRefs?: string[];
  hueAdjustment?: number;
  hueReferenceHex?: string;
  deleteThemeVersionOnRestore?: { name: string; version: string };
}

export async function restoreThemeState(
  setState: SetState,
  params: RestoreThemeStateParams,
): Promise<void> {
  if (params.theme !== undefined) {
    setState({ type: 'SET_THEME', theme: params.theme });
  }
  if (
    params.checkedColorRefs !== undefined &&
    params.checkedContrastRefs !== undefined
  ) {
    setThemePaneSelections(setState, params.checkedColorRefs, params.checkedContrastRefs);
  }
  if (params.theme !== undefined && params.theme !== null) {
    setState({
      type: 'SET_SELECTED_THEME_REF',
      ref: { name: params.theme.name, version: params.theme.version },
    });
  }
  if (params.hueAdjustment !== undefined) {
    setThemeHueAdjustment(setState, params.hueAdjustment);
  }
  if (params.hueReferenceHex !== undefined) {
    setThemeHueReferenceHex(setState, params.hueReferenceHex);
  }
  if (params.theme !== undefined && params.theme !== null) {
    setThemeSaveError(setState, null);
    try {
      await themeService.saveTheme(params.theme);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error('restoreThemeState persist failed', err);
      setThemeSaveError(setState, message);
    }
    await refreshThemeRefsOnly(setState);
  }
  if (params.deleteThemeVersionOnRestore) {
    await themeService.deleteTheme(
      params.deleteThemeVersionOnRestore.name,
      params.deleteThemeVersionOnRestore.version,
    );
    await refreshThemeRefsOnly(setState);
  }
}

export async function generateTheme(
  setState: SetState,
  themeName: string,
  themeVersion: string,
  templateName: string,
  templateVersion: string,
): Promise<void> {
  log.debug('generateTheme', themeName, templateName);
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
    log.warn('generateTheme failed', message);
    setGenerateResult(setState, { success: false, message });
  }
}
