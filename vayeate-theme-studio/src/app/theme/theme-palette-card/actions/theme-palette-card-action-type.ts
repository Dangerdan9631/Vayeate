import type { HexColor } from '../../../../model/schema/primitives';
import type { ThemePaneState } from '../../../../model/theme-pane-state';
import { coalesceLatest, type ActionCoalesceFn } from '../../../core/action-queue/action-coalesce';
import type { AppAction } from '../../../core/action-queue/app-action';

/**
 * Action type literals dispatched from the Theme Palette Card.
 */
export enum ThemePaletteCardActionType {
  ApplyToDarkCheckboxOnToggle = 'THEME_PALETTE_APPLY_TO_DARK_CHECKBOX_ON_TOGGLE',
  ApplyToLightCheckboxOnToggle = 'THEME_PALETTE_APPLY_TO_LIGHT_CHECKBOX_ON_TOGGLE',
  AssignColorEyedropperButtonOnClick = 'THEME_PALETTE_ASSIGN_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  AssignColorEyeDropperOnCommit = 'THEME_PALETTE_ASSIGN_COLOR_EYE_DROPPER_ON_COMMIT',
  AssignColorPickerOnSelect = 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT',
  AssignColorPickerOnCommit = 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_COMMIT',
  AssignColorPickerOnClose = 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_CLOSE',
  HueReferenceRecenterButtonOnClick = 'THEME_PALETTE_HUE_REFERENCE_RECENTER_BUTTON_ON_CLICK',
  HueReferenceCommit = 'THEME_PALETTE_HUE_REFERENCE_COMMIT',
  HueReferenceColorEyedropperButtonOnClick = 'THEME_PALETTE_HUE_REFERENCE_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  HueReferenceEyeDropperOnCommit = 'THEME_PALETTE_HUE_REFERENCE_EYE_DROPPER_ON_COMMIT',
  HueSliderOnDelta = 'THEME_PALETTE_HUE_SLIDER_ON_DELTA',
  HueSliderOnCommit = 'THEME_PALETTE_HUE_SLIDER_ON_COMMIT',
  SaturationSliderOnDelta = 'THEME_PALETTE_SATURATION_SLIDER_ON_DELTA',
  SaturationSliderOnCommit = 'THEME_PALETTE_SATURATION_SLIDER_ON_COMMIT',
  ValueSliderOnDelta = 'THEME_PALETTE_VALUE_SLIDER_ON_DELTA',
  ValueSliderOnCommit = 'THEME_PALETTE_VALUE_SLIDER_ON_COMMIT',
  ClusterCountSliderOnDelta = 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_DELTA',
  ClusterCountSliderOnCommit = 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_COMMIT',
  ClusterVariantCheckboxOnToggle = 'THEME_PALETTE_CLUSTER_VARIANT_CHECKBOX_ON_TOGGLE',
  RecomputeClusters = 'THEME_PALETTE_RECOMPUTE_CLUSTERS',
  ColorRefsSelectionCommit = 'THEME_PALETTE_COLOR_REFS_SELECTION_COMMIT',
}

/**
 * Union of actions handled by the Theme Palette Card.
 */
export type ThemePaletteCardActions =
  | { type: ThemePaletteCardActionType.ApplyToDarkCheckboxOnToggle; checked: boolean }
  | { type: ThemePaletteCardActionType.ApplyToLightCheckboxOnToggle; checked: boolean }
  | { type: ThemePaletteCardActionType.AssignColorEyedropperButtonOnClick }
  | { type: ThemePaletteCardActionType.AssignColorEyeDropperOnCommit; value: HexColor }
  | { type: ThemePaletteCardActionType.AssignColorPickerOnSelect; value: HexColor }
  | { type: ThemePaletteCardActionType.AssignColorPickerOnCommit; value: HexColor }
  | { type: ThemePaletteCardActionType.AssignColorPickerOnClose; value: HexColor; snapshot: ThemePaneState }
  | { type: ThemePaletteCardActionType.HueReferenceRecenterButtonOnClick }
  | { type: ThemePaletteCardActionType.HueReferenceCommit; value: string }
  | { type: ThemePaletteCardActionType.HueReferenceColorEyedropperButtonOnClick }
  | { type: ThemePaletteCardActionType.HueReferenceEyeDropperOnCommit; value: HexColor }
  | { type: ThemePaletteCardActionType.HueSliderOnDelta; value: number }
  | { type: ThemePaletteCardActionType.HueSliderOnCommit; value: number }
  | { type: ThemePaletteCardActionType.SaturationSliderOnDelta; value: number }
  | { type: ThemePaletteCardActionType.SaturationSliderOnCommit; value: number }
  | { type: ThemePaletteCardActionType.ValueSliderOnDelta; value: number }
  | { type: ThemePaletteCardActionType.ValueSliderOnCommit; value: number }
  | { type: ThemePaletteCardActionType.ClusterCountSliderOnDelta; value: number }
  | { type: ThemePaletteCardActionType.ClusterCountSliderOnCommit; value: number }
  | { type: ThemePaletteCardActionType.ClusterVariantCheckboxOnToggle; checked: boolean }
  | { type: ThemePaletteCardActionType.RecomputeClusters }
  | { type: ThemePaletteCardActionType.ColorRefsSelectionCommit; refs: string[]; checked: boolean };


const themePaletteCardTypes = new Set<string>(Object.values(ThemePaletteCardActionType));

/**
 * Returns whether the app action belongs to the Theme Palette Card.
 * @param a Input for this call.
 */
export function isThemePaletteCardAction(a: AppAction): a is ThemePaletteCardActions {
  return themePaletteCardTypes.has(a.type);
}

const themePaletteCardCoalescers: Partial<Record<ThemePaletteCardActionType, ActionCoalesceFn>> = {
  [ThemePaletteCardActionType.AssignColorPickerOnSelect]: coalesceLatest,
  [ThemePaletteCardActionType.HueSliderOnDelta]: coalesceLatest,
  [ThemePaletteCardActionType.SaturationSliderOnDelta]: coalesceLatest,
  [ThemePaletteCardActionType.ValueSliderOnDelta]: coalesceLatest,
  [ThemePaletteCardActionType.ClusterCountSliderOnDelta]: coalesceLatest,
};

/**
 * Coalesces consecutive Theme Palette Card actions when the action queue merges duplicate streams.
 * @param pending Input for this call.
 * @param incoming Input for this call.
 * @returns Coalesced action, or null when coalescing does not apply.
 */
export function tryCoalesceThemePaletteCardAction(
  pending: ThemePaletteCardActions,
  incoming: ThemePaletteCardActions,
): ThemePaletteCardActions | null {
  const coalesce = themePaletteCardCoalescers[pending.type];
  return coalesce ? (coalesce(pending, incoming) as ThemePaletteCardActions) : null;
}
