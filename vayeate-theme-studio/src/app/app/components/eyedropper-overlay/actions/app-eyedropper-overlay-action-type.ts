import type { HexColor } from '../../../../../model/schema/primitives';

export enum AppEyedropperOverlayActionType {
  CancelButtonOnClick = 'APP_EYEDROPPER_OVERLAY_CANCEL_BUTTON_ON_CLICK',
  ColorPickCommitButtonOnClick = 'APP_EYEDROPPER_OVERLAY_COLOR_PICK_COMMIT_BUTTON_ON_CLICK',
}

export type AppEyedropperOverlayActions =
  | { type: AppEyedropperOverlayActionType.CancelButtonOnClick }
  | { type: AppEyedropperOverlayActionType.ColorPickCommitButtonOnClick; hex: HexColor };
