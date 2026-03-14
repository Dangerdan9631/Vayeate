import type { Theme, ThemeReference } from '../model/schemas';
import type { AppStateUpdate } from '../state/app-state';
import { themeService } from '../services/theme-service';

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
  setState({ type: 'SET_THEME_REFS', refs });
  return refs;
}

export async function createTheme(
  _setState: SetState,
  params: { name: string },
): Promise<Theme> {
  const theme = await themeService.createTheme(params);
  return theme;
}

export async function loadTheme(
  setState: SetState,
  name: string,
  version: string,
): Promise<Theme | null> {
  const loaded = await themeService.loadTheme(name, version);
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

/** Persist theme to disk only. Single responsibility: save. */
export async function saveTheme(theme: Theme): Promise<void> {
  await themeService.saveTheme(theme);
}

/** Delete one theme version from disk. Single responsibility: delete. */
export async function deleteTheme(name: string, version: string): Promise<void> {
  await themeService.deleteTheme(name, version);
}

export interface RestoreThemeStateParams {
  theme?: Theme | null;
  checkedColorRefs?: string[];
  checkedContrastRefs?: string[];
  hueAdjustment?: number;
  hueReferenceHex?: string;
  deleteThemeVersionOnRestore?: { name: string; version: string };
}

