import type { EyedropperPointerSample } from '../../../../model/eyedropper';
import type { Size } from '../../../../model/point';
import type { HexColor } from '../../../../model/schema/primitives';
import { coalesceLatest, type ActionCoalesceFn } from '../../../core/action-queue/action-coalesce';
import type { AppAction } from '../../../core/action-queue/app-action';

export enum EyedropperOverlayActionType {
  CancelButtonOnClick = 'APP_EYEDROPPER_OVERLAY_CANCEL_BUTTON_ON_CLICK',
  ColorPickCommitButtonOnClick = 'APP_EYEDROPPER_OVERLAY_COLOR_PICK_COMMIT_BUTTON_ON_CLICK',
  OverlayWheelOnScroll = 'APP_EYEDROPPER_OVERLAY_WHEEL_ON_SCROLL',
  OverlayMouseMove = 'APP_EYEDROPPER_OVERLAY_MOUSE_MOVE',
  OverlayViewportSizeChange = 'APP_EYEDROPPER_OVERLAY_VIEWPORT_SIZE_CHANGE',
}

export type AppEyedropperOverlayActions =
  | { type: EyedropperOverlayActionType.CancelButtonOnClick }
  | { type: EyedropperOverlayActionType.ColorPickCommitButtonOnClick; hex: HexColor }
  | { type: EyedropperOverlayActionType.OverlayWheelOnScroll; deltaY: number }
  | { type: EyedropperOverlayActionType.OverlayMouseMove; pointer: EyedropperPointerSample }
  | { type: EyedropperOverlayActionType.OverlayViewportSizeChange; size: Size };

const appEyedropperOverlayTypes = new Set<string>(Object.values(EyedropperOverlayActionType));

export function isAppEyedropperOverlayAction(a: AppAction): a is AppEyedropperOverlayActions {
  return appEyedropperOverlayTypes.has(a.type);
}

const appEyedropperOverlayCoalescers: Partial<Record<EyedropperOverlayActionType, ActionCoalesceFn>> = {
  [EyedropperOverlayActionType.OverlayMouseMove]: coalesceLatest,
  [EyedropperOverlayActionType.OverlayViewportSizeChange]: coalesceLatest,
};

export function tryCoalesceAppEyedropperOverlayAction(
  pending: AppEyedropperOverlayActions,
  incoming: AppEyedropperOverlayActions,
): AppEyedropperOverlayActions | null {
  const coalesce = appEyedropperOverlayCoalescers[pending.type];
  return coalesce ? (coalesce(pending, incoming) as AppEyedropperOverlayActions) : null;
}
