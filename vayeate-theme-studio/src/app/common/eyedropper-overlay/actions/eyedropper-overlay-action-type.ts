import type { EyedropperPointerSample } from '../../../../model/eyedropper';
import type { Size } from '../../../../model/point';
import type { HexColor } from '../../../../model/schema/primitives';
import { coalesceLatest, type ActionCoalesceFn } from '../../../core/action-queue/action-coalesce';
import type { AppAction } from '../../../core/action-queue/app-action';

/**
 * Action type discriminants for the eyedropper overlay flow.
 */
export enum EyedropperOverlayActionType {
  CancelButtonOnClick = 'APP_EYEDROPPER_OVERLAY_CANCEL_BUTTON_ON_CLICK',
  ColorPickCommitButtonOnClick = 'APP_EYEDROPPER_OVERLAY_COLOR_PICK_COMMIT_BUTTON_ON_CLICK',
  OverlayWheelOnScroll = 'APP_EYEDROPPER_OVERLAY_WHEEL_ON_SCROLL',
  OverlayMouseMove = 'APP_EYEDROPPER_OVERLAY_MOUSE_MOVE',
  OverlayViewportSizeChange = 'APP_EYEDROPPER_OVERLAY_VIEWPORT_SIZE_CHANGE',
}

/**
 * Union of app actions handled by the eyedropper overlay handler.
 */
export type AppEyedropperOverlayActions =
  | { type: EyedropperOverlayActionType.CancelButtonOnClick }
  | { type: EyedropperOverlayActionType.ColorPickCommitButtonOnClick; hex: HexColor }
  | { type: EyedropperOverlayActionType.OverlayWheelOnScroll; deltaY: number }
  | { type: EyedropperOverlayActionType.OverlayMouseMove; pointer: EyedropperPointerSample }
  | { type: EyedropperOverlayActionType.OverlayViewportSizeChange; size: Size };

const appEyedropperOverlayTypes = new Set<string>(Object.values(EyedropperOverlayActionType));

/**
 * Narrows a queued app action to an eyedropper overlay action when the type matches.
 * @param a Action from the app action queue.
 * @returns True when the action belongs to the eyedropper overlay union.
 */
export function isAppEyedropperOverlayAction(a: AppAction): a is AppEyedropperOverlayActions {
  return appEyedropperOverlayTypes.has(a.type);
}

const appEyedropperOverlayCoalescers: Partial<Record<EyedropperOverlayActionType, ActionCoalesceFn>> = {
  [EyedropperOverlayActionType.OverlayMouseMove]: coalesceLatest,
  [EyedropperOverlayActionType.OverlayViewportSizeChange]: coalesceLatest,
};

/**
 * Merges a pending eyedropper overlay action with an incoming duplicate when coalescing is configured.
 * @param pending Action already waiting in the queue.
 * @param incoming New action of the same type.
 * @returns The merged action, or null when this type does not coalesce.
 */
export function tryCoalesceAppEyedropperOverlayAction(
  pending: AppEyedropperOverlayActions,
  incoming: AppEyedropperOverlayActions,
): AppEyedropperOverlayActions | null {
  const coalesce = appEyedropperOverlayCoalescers[pending.type];
  return coalesce ? (coalesce(pending, incoming) as AppEyedropperOverlayActions) : null;
}
