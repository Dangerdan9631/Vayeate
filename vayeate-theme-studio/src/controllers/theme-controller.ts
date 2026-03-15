import type {
  ColorAssignment,
  ColorVariableKey,
  ContrastAssignment,
  ContrastAssignmentValue,
  ContrastComparisonMethod,
  ContrastVariableKey,
  ContrastValue,
  TemplateName,
  Theme,
  Version,
} from '../model/schemas';
import { compareVersions, nextPatchVersion } from '../utils/version';
import { themeService } from '../services/theme-service';
import { templateService } from '../services/template-service';
import { mergeAssignmentsFromTemplate } from '../core/theme-template-merge';
import { applyHueShift } from '../core/color';
import {
  loadThemeRefs as loadThemeRefsOp,
  loadTheme,
  setSelectedThemeRef,
  setTheme,
  setThemePaneSelections as setThemePaneSelectionsOp,
  setThemeHueAdjustment as setThemeHueAdjustmentOp,
  setThemeHueReferenceHex as setThemeHueReferenceHexOp,
  setThemeSaveError,
  setThemeCreateFormName,
  setGenerateResult,
  setAssignColorDraftText as setAssignColorDraftTextOp,
  setThemeVariablesSearchText as setThemeVariablesSearchTextOp,
  setThemePreviewVariableFilterText as setThemePreviewVariableFilterTextOp,
  setThemePreviewVariableFilterClear as setThemePreviewVariableFilterClearOp,
  setThemePreviewSelectedSampleKey as setThemePreviewSelectedSampleKeyOp,
  saveTheme as saveThemeOp,
  deleteTheme as deleteThemeOp,
  createTheme as createThemeOperation,
  type SetState,
  type RestoreThemeStateParams,
} from '../operations/theme-operations';
import { setCurrentUndoStackId, type GetState } from '../operations/undo-operations';
import type { ThemePreviewTokenRefField } from '../actions/action-types';

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
    applyPaletteToDark: true,
    applyPaletteToLight: true,
    paletteClusterCountK: 5,
    paletteClusterGroupIds: [],
  };
}

export function themeStackId(name: string, version: string): string {
  return `theme:${name}:${version}`;
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
  const loaded = await loadTheme(setState, name, version);
  if (loaded?.templateRef) {
    const template = await templateService.loadTemplate(loaded.templateRef.name, loaded.templateRef.version);
    if (template) {
      const colorRefs = new Set(loaded.colorAssignments.map((a) => a.colorRef));
      const contrastRefs = new Set(loaded.contrastAssignments.map((a) => a.contrastVariableRef));
      const missingColor = template.colorVariables.some((v) => !colorRefs.has(v.key));
      const missingContrast = template.contrastVariables.some((v) => !contrastRefs.has(v.key));
      if (missingColor || missingContrast) {
        const merged = mergeAssignmentsFromTemplate({ ...loaded }, template);
        setTheme(setState, merged);
        saveTheme(setState, merged);
      }
    }
  }
  setCurrentUndoStackId(setState, themeStackId(name, version));
}

export async function selectThemeByName(
  setState: SetState,
  getState: GetState,
  name: string,
): Promise<void> {
  const state = getState();
  const refs = state.themes.themeRefs.filter((r) => r.name === name);
  if (refs.length === 0) return;
  const best = refs.reduce((a, b) =>
    compareVersions(a.version, b.version) > 0 ? a : b,
  );
  await selectThemeAndLoad(setState, best.name, best.version);
}

export function openThemeCreateDialog(setState: SetState): void {
  setThemeCreateFormName(setState, '');
  setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: true });
}

export function closeThemeCreateDialog(setState: SetState): void {
  setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: false });
  setThemeCreateFormName(setState, '');
}

export async function createTheme(
  setState: SetState,
  params: { name: string },
): Promise<void> {
  setState({ type: 'SET_THEME_IS_CREATING', value: true });
  setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: false });
  setThemeCreateFormName(setState, '');
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
    setCurrentUndoStackId(setState, themeStackId(newTheme.name, newTheme.version));
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
    setCurrentUndoStackId(setState, themeStackId(nextTh.name, nextTh.version));
  } else {
    setSelectedThemeRef(setState, null);
    setTheme(setState, null);
    setThemePaneSelectionsOp(setState, [], []);
    setCurrentUndoStackId(setState, null);
  }
}

export function clearThemeSaveError(setState: SetState): void {
  setThemeSaveError(setState, null);
}

export async function incrementThemeVersion(
  setState: SetState,
  getState: GetState,
): Promise<void> {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme) return;
  const newVersion = nextPatchVersion(theme.version);
  const bumped: Theme = { ...theme, version: newVersion };
  if (saveThemeTimeoutId !== null) {
    clearTimeout(saveThemeTimeoutId);
    saveThemeTimeoutId = null;
  }
  pendingThemeToSave = null;
  setThemeHueAdjustmentOp(setState, 0);
  try {
    await saveThemeOp(bumped);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setThemeSaveError(setState, message);
    return;
  }
  await loadThemeRefsOp(setState);
  setSelectedThemeRef(setState, { name: theme.name, version: newVersion });
  const loaded = await loadTheme(setState, theme.name, newVersion);
  if (loaded) {
    setThemePaneSelectionsOp(
      setState,
      loaded.colorAssignments.map((a) => a.colorRef),
      loaded.contrastAssignments.map((a) => a.contrastVariableRef),
    );
  }
  setCurrentUndoStackId(setState, themeStackId(theme.name, newVersion));
}

export async function setThemeTemplate(
  setState: SetState,
  getState: GetState,
  name: TemplateName,
  version: Version,
): Promise<void> {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme) return;
  const template = await templateService.loadTemplate(name, version);
  if (!template) return;
  const merged = mergeAssignmentsFromTemplate(theme, template);
  setTheme(setState, merged);
  saveTheme(setState, merged);
}

/** Set a preview token ref field (THEME_DETAILS_PREVIEW_TOKEN_REF_LIST_ON_COMMIT). Updates theme, saves, recenters hue. */
export function setThemePreviewTokenRef(
  setState: SetState,
  getState: GetState,
  tokenRefField: ThemePreviewTokenRefField,
  value: string | null,
): void {
  const theme = getState().themes.theme;
  if (!theme) return;
  const next: Theme = { ...theme, [tokenRefField]: value };
  setTheme(setState, next);
  saveTheme(setState, next);
  const state = getState();
  const hueRef = state.themes.hueReferenceHex ?? '';
  const hueAdjustment = state.themes.hueAdjustment ?? 0;
  const nextRefHex = applyHueShift(hueRef, hueAdjustment / 100);
  setThemeHueReferenceHexOp(setState, nextRefHex);
  setThemeHueAdjustmentOp(setState, 0);
}

/** Template "use template" toggle: clear templateRef when unchecked (THEME_DETAILS_CATALOG_CHECKBOX = template checkbox). */
export function setThemeTemplateToggle(
  setState: SetState,
  getState: GetState,
  checked?: boolean,
): void {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme) return;
  if (checked === false) {
    const withoutTemplate: Theme = { ...theme, templateRef: null };
    setTheme(setState, withoutTemplate);
    saveTheme(setState, withoutTemplate);
  }
}

/** Set template version for current theme (THEME_DETAILS_CATALOG_VERSION_LIST = template version). */
export async function setThemeTemplateVersionOnly(
  setState: SetState,
  getState: GetState,
  version: Version,
): Promise<void> {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme?.templateRef) return;
  await setThemeTemplate(setState, getState, theme.templateRef.name, version);
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

// --- Palette (THEME_PALETTE_* V2) ---

function applyHueToAssignmentsFiltered(
  assignments: readonly ColorAssignment[],
  shift: number,
  checkedRefs: ReadonlySet<string>,
  options: { applyToDark: boolean; applyToLight: boolean },
): ColorAssignment[] {
  const { applyToDark, applyToLight } = options;
  return assignments.map((a) => {
    if (!checkedRefs.has(a.colorRef)) return a;
    return {
      ...a,
      dark:
        applyToDark && a.dark
          ? { value: applyHueShift(a.dark.value, shift) }
          : a.dark,
      light:
        applyToLight && !a.useDarkForLight && a.light
          ? { value: applyHueShift(a.light.value, shift) }
          : a.light,
    };
  });
}

/** Normalize hex string for palette; returns null if invalid. */
function normalizeHexForPalette(hex: string): string | null {
  const s = (hex ?? '').trim().toLowerCase();
  const withHash = s.startsWith('#') ? s : s ? `#${s}` : '';
  if (!withHash) return null;
  const bare = withHash.slice(1);
  if (!/^[0-9a-f]+$/.test(bare) || (bare.length !== 3 && bare.length !== 6 && bare.length !== 8))
    return null;
  const expanded =
    bare.length === 3 ? bare.split('').map((c) => c + c).join('') : bare;
  return `#${expanded}`;
}

export function setAssignColorDraftText(setState: SetState, value: string): void {
  setAssignColorDraftTextOp(setState, value);
}

export function setApplyPaletteToDark(
  setState: SetState,
  getState: GetState,
  checked: boolean,
): void {
  const theme = getState().themes.theme;
  if (!theme) return;
  const next: Theme = { ...theme, applyPaletteToDark: checked };
  setTheme(setState, next);
  saveTheme(setState, next);
}

export function setApplyPaletteToLight(
  setState: SetState,
  getState: GetState,
  checked: boolean,
): void {
  const theme = getState().themes.theme;
  if (!theme) return;
  const next: Theme = { ...theme, applyPaletteToLight: checked };
  setTheme(setState, next);
  saveTheme(setState, next);
}

/** Update cluster count in state only (slider drag; no persist). */
export function setPaletteClusterCountKPreview(
  setState: SetState,
  getState: GetState,
  value: number,
): void {
  const theme = getState().themes.theme;
  if (!theme) return;
  const k = Math.max(1, Math.min(12, value));
  const next: Theme = { ...theme, paletteClusterCountK: k };
  setTheme(setState, next);
}

export function setPaletteClusterCountK(
  setState: SetState,
  getState: GetState,
  value: number,
): void {
  const theme = getState().themes.theme;
  if (!theme) return;
  const k = Math.max(1, Math.min(12, value));
  const next: Theme = { ...theme, paletteClusterCountK: k };
  setTheme(setState, next);
  saveTheme(setState, next);
}

export function setPaletteClusterGroupToggled(
  setState: SetState,
  getState: GetState,
  groupId: string,
  checked: boolean,
): void {
  const theme = getState().themes.theme;
  if (!theme) return;
  const current = theme.paletteClusterGroupIds ?? [];
  const set = new Set(current);
  if (checked) set.add(groupId);
  else set.delete(groupId);
  const next: Theme = { ...theme, paletteClusterGroupIds: [...set] };
  setTheme(setState, next);
  saveTheme(setState, next);
}

/** Apply current assign-color draft text if valid (e.g. assign button click). */
export function applyAssignColorDraft(setState: SetState, getState: GetState): void {
  const draft = getState().themes.assignColorDraftText;
  if (!draft.trim()) return;
  commitAssignColorText(setState, getState, draft);
}

export function commitAssignColorText(
  setState: SetState,
  getState: GetState,
  value: string,
): void {
  const normalized = normalizeHexForPalette(value);
  if (!normalized) return;
  const state = getState();
  const theme = state.themes.theme;
  const checkedColorRefs = new Set(state.themes.checkedColorRefs);
  if (!theme || checkedColorRefs.size === 0) return;
  const applyToDark = theme.applyPaletteToDark ?? true;
  const applyToLight = theme.applyPaletteToLight ?? true;
  const hueAdjustment = state.themes.hueAdjustment;
  let workingAssignments = theme.colorAssignments;
  if (hueAdjustment !== 0) {
    workingAssignments = applyHueToAssignmentsFiltered(
      theme.colorAssignments,
      hueAdjustment / 100,
      checkedColorRefs,
      { applyToDark, applyToLight },
    );
  }
  const newAssignments = workingAssignments.map((a) => {
    if (!checkedColorRefs.has(a.colorRef)) return a;
    let next = { ...a };
    if (applyToDark) next = { ...next, dark: { value: normalized } };
    if (applyToLight) next = { ...next, light: { value: normalized } };
    return next;
  });
  const base = { ...theme };
  const nextTheme: Theme = { ...base, colorAssignments: newAssignments };
  setThemeHueAdjustmentOp(setState, 0);
  setTheme(setState, nextTheme);
  saveTheme(setState, nextTheme);
}

export function assignColorFromPicker(
  setState: SetState,
  getState: GetState,
  hex: string,
  _ref?: string,
): void {
  commitAssignColorText(setState, getState, hex);
}

export function setAssignColorPreview(
  setState: SetState,
  getState: GetState,
  hex: string,
): void {
  const normalized = normalizeHexForPalette(hex);
  if (!normalized) return;
  const state = getState();
  const theme = state.themes.theme;
  const checkedColorRefs = new Set(state.themes.checkedColorRefs);
  if (!theme || checkedColorRefs.size === 0) return;
  const applyToDark = theme.applyPaletteToDark ?? true;
  const applyToLight = theme.applyPaletteToLight ?? true;
  const hueAdjustment = state.themes.hueAdjustment;
  let workingAssignments = theme.colorAssignments;
  if (hueAdjustment !== 0) {
    workingAssignments = applyHueToAssignmentsFiltered(
      theme.colorAssignments,
      hueAdjustment / 100,
      checkedColorRefs,
      { applyToDark, applyToLight },
    );
  }
  const newAssignments = workingAssignments.map((a) => {
    if (!checkedColorRefs.has(a.colorRef)) return a;
    let next = { ...a };
    if (applyToDark) next = { ...next, dark: { value: normalized } };
    if (applyToLight) next = { ...next, light: { value: normalized } };
    return next;
  });
  const nextTheme: Theme = { ...theme, colorAssignments: newAssignments };
  setTheme(setState, nextTheme);
}

/** Persist current theme (THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_CLOSE). */
export function persistCurrentTheme(setState: SetState, getState: GetState): void {
  const theme = getState().themes.theme;
  if (theme) saveTheme(setState, theme);
}

export function recenterHueReference(setState: SetState, getState: GetState): void {
  const state = getState();
  const theme = state.themes.theme;
  const hueAdjustment = state.themes.hueAdjustment;
  if (!theme || hueAdjustment === 0) {
    setThemeHueAdjustmentOp(setState, 0);
    return;
  }
  const checkedColorRefs = new Set(state.themes.checkedColorRefs);
  const applyToDark = theme.applyPaletteToDark ?? true;
  const applyToLight = theme.applyPaletteToLight ?? true;
  const newAssignments = applyHueToAssignmentsFiltered(
    theme.colorAssignments,
    hueAdjustment / 100,
    checkedColorRefs,
    { applyToDark, applyToLight },
  );
  const nextTheme: Theme = { ...theme, colorAssignments: newAssignments };
  setTheme(setState, nextTheme);
  saveTheme(setState, nextTheme);
  setThemeHueAdjustmentOp(setState, 0);
}

export function setPaletteSwatchGroupSelection(
  setState: SetState,
  getState: GetState,
  refs: string[],
  checked: boolean,
): void {
  const state = getState();
  const currentColor = state.themes.checkedColorRefs;
  const nextSet = new Set(currentColor);
  for (const r of refs) {
    if (checked) nextSet.add(r);
    else nextSet.delete(r);
  }
  setThemePaneSelectionsOp(setState, [...nextSet], state.themes.checkedContrastRefs);
}

/** Set full pane selection (color and contrast refs) in one go. */
export function setPaletteFullSelection(
  setState: SetState,
  colorRefs: string[],
  contrastRefs: string[],
): void {
  setThemePaneSelectionsOp(setState, colorRefs, contrastRefs);
}

/** Set selection to a single ref (primary swatch click). */
export function setPalettePrimarySwatch(
  setState: SetState,
  getState: GetState,
  ref: string | undefined,
): void {
  if (ref == null) return;
  const state = getState();
  setThemePaneSelectionsOp(setState, [ref], state.themes.checkedContrastRefs);
}

/** Add ref to selection (member swatch click). */
export function setPaletteMemberSwatch(
  setState: SetState,
  getState: GetState,
  ref: string | undefined,
): void {
  if (ref == null) return;
  setPaletteSwatchGroupSelection(setState, getState, [ref], true);
}

// --- Theme variables (THEME_VARIABLES_* V2) ---

const UNGROUPED_KEY = '__ungrouped__';

export function setThemeVariablesSearchText(setState: SetState, value: string): void {
  setThemeVariablesSearchTextOp(setState, value);
}

// --- Theme preview (THEME_PREVIEW_* V2) ---

/** Set pane selection to the single variable ref (THEME_PREVIEW_VARIABLE_LIST_ON_COMMIT). */
export function setPreviewVariableSelection(
  setState: SetState,
  getState: GetState,
  value: string,
): void {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme?.templateRef || !value) return;
  const isColorRef = theme.colorAssignments.some((a) => a.colorRef === value);
  const isContrastRef = theme.contrastAssignments.some((a) => a.contrastVariableRef === value);
  if (isColorRef) {
    setThemePaneSelectionsOp(setState, [value], []);
  } else if (isContrastRef) {
    setThemePaneSelectionsOp(setState, [], [value]);
  }
}

export function setPreviewVariableFilterText(setState: SetState, value: string): void {
  setThemePreviewVariableFilterTextOp(setState, value);
}

export function clearPreviewVariableFilter(setState: SetState): void {
  setThemePreviewVariableFilterClearOp(setState);
}

export function setPreviewSelectedSample(setState: SetState, value: string): void {
  setThemePreviewSelectedSampleKeyOp(setState, value);
}

/** No-op; used to scroll preview windows (THEME_PREVIEW_SAMPLE_BUTTON_ON_CLICK). */
export function previewSampleButtonScroll(_setState: SetState): void {}

export function setVariablesSelectAll(
  setState: SetState,
  getState: GetState,
  checked?: boolean,
): void {
  const theme = getState().themes.theme;
  if (!theme) return;
  const nextColor = checked === true ? theme.colorAssignments.map((a) => a.colorRef) : [];
  const nextContrast = checked === true ? theme.contrastAssignments.map((a) => a.contrastVariableRef) : [];
  setThemePaneSelectionsOp(setState, nextColor, nextContrast);
}

export function setVariablesSelectByType(
  setState: SetState,
  getState: GetState,
  checked?: boolean,
  variableType?: string,
): void {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme) return;
  const colorRefs = state.themes.checkedColorRefs;
  const contrastRefs = state.themes.checkedContrastRefs;
  let nextColor = [...colorRefs];
  let nextContrast = [...contrastRefs];
  if (variableType === 'color') {
    nextColor = checked === true ? theme.colorAssignments.map((a) => a.colorRef) : [];
  } else if (variableType === 'contrast') {
    nextContrast = checked === true ? theme.contrastAssignments.map((a) => a.contrastVariableRef) : [];
  }
  setThemePaneSelectionsOp(setState, nextColor, nextContrast);
}

export async function setVariablesSelectByGroup(
  setState: SetState,
  getState: GetState,
  checked?: boolean,
  groupId?: string,
): Promise<void> {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme?.templateRef || groupId == null) return;
  const template = await templateService.loadTemplate(theme.templateRef.name, theme.templateRef.version);
  if (!template) return;
  const g = groupId === '' ? UNGROUPED_KEY : groupId;
  const colorRefsInGroup = template.colorVariables
    .filter((v) => (v.groupRef ?? UNGROUPED_KEY) === g)
    .map((v) => v.key);
  const contrastRefsInGroup = template.contrastVariables
    .filter((v) => (v.groupRef ?? UNGROUPED_KEY) === g)
    .map((v) => v.key);
  const nextColor = new Set(state.themes.checkedColorRefs);
  const nextContrast = new Set(state.themes.checkedContrastRefs);
  colorRefsInGroup.forEach((r) => (checked ? nextColor.add(r) : nextColor.delete(r)));
  contrastRefsInGroup.forEach((r) => (checked ? nextContrast.add(r) : nextContrast.delete(r)));
  setThemePaneSelectionsOp(setState, [...nextColor], [...nextContrast]);
}

/** Toggle one variable (color or contrast) in selection; ref determines which set to update. */
export function toggleVariableSelection(
  setState: SetState,
  getState: GetState,
  checked: boolean | undefined,
  ref: ColorVariableKey | ContrastVariableKey | undefined,
): void {
  if (ref == null) return;
  const state = getState();
  const theme = state.themes.theme;
  if (!theme) return;
  const colorSet = new Set(state.themes.checkedColorRefs);
  const contrastSet = new Set(state.themes.checkedContrastRefs);
  const isColor = theme.colorAssignments.some((a) => a.colorRef === ref);
  if (isColor) {
    if (checked === true) colorSet.add(ref);
    else if (checked === false) colorSet.delete(ref);
    else {
      if (colorSet.has(ref)) colorSet.delete(ref);
      else colorSet.add(ref);
    }
    setThemePaneSelectionsOp(setState, [...colorSet], state.themes.checkedContrastRefs);
  } else {
    if (checked === true) contrastSet.add(ref);
    else if (checked === false) contrastSet.delete(ref);
    else {
      if (contrastSet.has(ref)) contrastSet.delete(ref);
      else contrastSet.add(ref);
    }
    setThemePaneSelectionsOp(setState, state.themes.checkedColorRefs, [...contrastSet]);
  }
}

/** Normalize hex for variables; returns null if invalid. */
function normalizeHexVar(hex: string): string | null {
  const s = (hex ?? '').trim().toLowerCase();
  const withHash = s.startsWith('#') ? s : s ? `#${s}` : '';
  if (!withHash) return null;
  const bare = withHash.slice(1);
  if (!/^[0-9a-f]+$/.test(bare) || (bare.length !== 3 && bare.length !== 6 && bare.length !== 8)) return null;
  const expanded = bare.length === 3 ? bare.split('').map((c) => c + c).join('') : bare;
  return `#${expanded}`;
}

function parseContrastValue(v: string | number): number | null {
  const n = typeof v === 'number' ? v : Number.parseFloat(String(v));
  if (Number.isNaN(n) || n < 1 || n > 10) return null;
  return n;
}

export function setColorVariableDark(
  setState: SetState,
  getState: GetState,
  ref: ColorVariableKey | undefined,
  value: string,
): void {
  const theme = getState().themes.theme;
  if (!theme || !ref) return;
  const normalized = normalizeHexVar(value);
  const newAssignments = theme.colorAssignments.map((a) =>
    a.colorRef === ref ? { ...a, dark: normalized !== null ? { value: normalized } : null } : a,
  );
  const next: Theme = { ...theme, colorAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}

export function setColorVariableLight(
  setState: SetState,
  getState: GetState,
  ref: ColorVariableKey | undefined,
  value: string,
): void {
  const theme = getState().themes.theme;
  if (!theme || !ref) return;
  const normalized = normalizeHexVar(value);
  const newAssignments = theme.colorAssignments.map((a) =>
    a.colorRef === ref ? { ...a, light: normalized !== null ? { value: normalized } : null } : a,
  );
  const next: Theme = { ...theme, colorAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}

export function setColorVariableFromHex(
  setState: SetState,
  getState: GetState,
  ref: ColorVariableKey | undefined,
  hex: string,
  target: 'dark' | 'light',
): void {
  const theme = getState().themes.theme;
  if (!theme || !ref) return;
  const normalized = normalizeHexVar(hex);
  if (!normalized) return;
  const newAssignments = theme.colorAssignments.map((a) => {
    if (a.colorRef !== ref) return a;
    const next = { ...a };
    if (target === 'dark') next.dark = { value: normalized };
    else next.light = { value: normalized };
    return next;
  });
  const next: Theme = { ...theme, colorAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}

/** Live preview only (no persist). For THEME_VARIABLES_*_COLOR_PICKER_ON_SELECT. */
export function setColorVariableFromHexPreview(
  setState: SetState,
  getState: GetState,
  ref: ColorVariableKey | undefined,
  hex: string,
  target: 'dark' | 'light',
): void {
  const theme = getState().themes.theme;
  if (!theme || !ref) return;
  const normalized = normalizeHexVar(hex);
  if (!normalized) return;
  const newAssignments = theme.colorAssignments.map((a) => {
    if (a.colorRef !== ref) return a;
    const next = { ...a };
    if (target === 'dark') next.dark = { value: normalized };
    else next.light = { value: normalized };
    return next;
  });
  const next: Theme = { ...theme, colorAssignments: newAssignments };
  setTheme(setState, next);
}

export function setContrastUseDarkForLight(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  checked: boolean | undefined,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const useDark = checked === true;
  const newAssignments = theme.contrastAssignments.map((a) =>
    a.contrastVariableRef === ref ? { ...a, useDarkForLight: useDark } : a,
  );
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}

export function setColorUseDarkForLight(
  setState: SetState,
  getState: GetState,
  ref: ColorVariableKey | undefined,
  checked: boolean | undefined,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const useDark = checked === true;
  const newAssignments = theme.colorAssignments.map((a) =>
    a.colorRef === ref ? { ...a, useDarkForLight: useDark } : a,
  );
  const next: Theme = { ...theme, colorAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}

function updateContrastAssignment(
  assignments: readonly ContrastAssignment[],
  contrastRef: string,
  mode: 'dark' | 'light',
  update: Partial<ContrastAssignmentValue>,
): ContrastAssignment[] {
  return assignments.map((a) => {
    if (a.contrastVariableRef !== contrastRef) return a;
    const current = mode === 'dark' ? a.dark : a.light;
    const base = current ?? { value: 1, comparisonMethod: 'greaterThan' as const, min: null, max: null };
    const merged = { ...base, ...update };
    return { ...a, [mode]: merged } as ContrastAssignment;
  });
}

export function setContrastVariableDarkValue(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  value: ContrastValue,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const num = typeof value === 'number' ? value : parseContrastValue(String(value));
  if (num == null) return;
  const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', { value: num });
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}

export function setContrastVariableDarkMethod(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  value: ContrastComparisonMethod,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', { comparisonMethod: value });
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}

export function setContrastVariableDarkMin(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  value: string,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const num = value === '' || value == null ? null : parseContrastValue(value);
  const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', { min: num });
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}

export function setContrastVariableDarkMax(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  value: string,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const num = value === '' || value == null ? null : parseContrastValue(value);
  const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', { max: num });
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}

export function setContrastVariableLightValue(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  value: ContrastValue,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const num = typeof value === 'number' ? value : parseContrastValue(String(value));
  if (num == null) return;
  const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'light', { value: num });
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}

export function setContrastVariableLightMethod(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  value: ContrastComparisonMethod,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'light', { comparisonMethod: value });
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}

export function setContrastVariableLightMin(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  value: string,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const num = value === '' || value == null ? null : parseContrastValue(value);
  const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'light', { min: num });
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}

export function setContrastVariableLightMax(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  value: string,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const num = value === '' || value == null ? null : parseContrastValue(value);
  const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'light', { max: num });
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}
