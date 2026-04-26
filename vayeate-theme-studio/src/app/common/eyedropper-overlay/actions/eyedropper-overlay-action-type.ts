import type { HexColor } from '../../../../model/schema/primitives';
import type { AppAction } from '../../../core/action-queue/app-action';

export enum EyedropperOverlayActionType {
  CancelButtonOnClick = 'APP_EYEDROPPER_OVERLAY_CANCEL_BUTTON_ON_CLICK',
  ColorPickCommitButtonOnClick = 'APP_EYEDROPPER_OVERLAY_COLOR_PICK_COMMIT_BUTTON_ON_CLICK',
}

export type AppEyedropperOverlayActions =
  | { type: EyedropperOverlayActionType.CancelButtonOnClick }
  | { type: EyedropperOverlayActionType.ColorPickCommitButtonOnClick; hex: HexColor };


const appEyedropperOverlayTypes = new Set<string>(Object.values(EyedropperOverlayActionType));

export function isAppEyedropperOverlayAction(a: AppAction): a is AppEyedropperOverlayActions {
  return appEyedropperOverlayTypes.has(a.type);
}
