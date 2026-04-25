import type { HexColor } from '../../../../../model/schema/primitives';
import type { AppAction } from '../../../../core/components/action-queue/app-action';

export enum ThemePaletteCardActionType {
  ApplyToDarkCheckboxOnToggle = 'THEME_PALETTE_APPLY_TO_DARK_CHECKBOX_ON_TOGGLE',
  ApplyToLightCheckboxOnToggle = 'THEME_PALETTE_APPLY_TO_LIGHT_CHECKBOX_ON_TOGGLE',
  AssignColorEyedropperButtonOnClick = 'THEME_PALETTE_ASSIGN_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  AssignColorPickerOnSelect = 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT',
  AssignColorPickerOnCommit = 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_COMMIT',
  AssignColorPickerOnClose = 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_CLOSE',
  HueReferenceRecenterButtonOnClick = 'THEME_PALETTE_HUE_REFERENCE_RECENTER_BUTTON_ON_CLICK',
  HueReferenceCommit = 'THEME_PALETTE_HUE_REFERENCE_COMMIT',
  HueReferenceColorEyedropperButtonOnClick = 'THEME_PALETTE_HUE_REFERENCE_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  HueSliderOnDelta = 'THEME_PALETTE_HUE_SLIDER_ON_DELTA',
  ClusterCountSliderOnDelta = 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_DELTA',
  ClusterCountSliderOnCommit = 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_COMMIT',
  ColorRefsSelectionCommit = 'THEME_PALETTE_COLOR_REFS_SELECTION_COMMIT',
}

export type ThemePaletteCardActions =
  | { type: ThemePaletteCardActionType.ApplyToDarkCheckboxOnToggle; checked: boolean }
  | { type: ThemePaletteCardActionType.ApplyToLightCheckboxOnToggle; checked: boolean }
  | { type: ThemePaletteCardActionType.AssignColorEyedropperButtonOnClick; colorRef: string }
  | { type: ThemePaletteCardActionType.AssignColorPickerOnSelect; value: HexColor }
  | { type: ThemePaletteCardActionType.AssignColorPickerOnCommit; value: HexColor }
  | { type: ThemePaletteCardActionType.AssignColorPickerOnClose }
  | { type: ThemePaletteCardActionType.HueReferenceRecenterButtonOnClick }
  | { type: ThemePaletteCardActionType.HueReferenceCommit; value: string }
  | { type: ThemePaletteCardActionType.HueReferenceColorEyedropperButtonOnClick }
  | { type: ThemePaletteCardActionType.HueSliderOnDelta; value: number }
  | { type: ThemePaletteCardActionType.ClusterCountSliderOnDelta; value: number }
  | { type: ThemePaletteCardActionType.ClusterCountSliderOnCommit; value: number }
  | { type: ThemePaletteCardActionType.ColorRefsSelectionCommit; refs: string[]; checked: boolean };


const themePaletteCardTypes = new Set<string>(Object.values(ThemePaletteCardActionType));

export function isThemePaletteCardAction(a: AppAction): a is ThemePaletteCardActions {
  return themePaletteCardTypes.has(a.type);
}
