import type { ThemeName } from '../../../../model/schema/primitives';
import { coalesceLatest, type ActionCoalesceFn } from '../../../core/action-queue/action-coalesce';
import type { AppAction } from '../../../core/action-queue/app-action';

/**
 * Action type literals dispatched from the Create Theme Dialog.
 */
export enum CreateThemeDialogActionType {
  NameTextOnChange = 'THEME_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',
  CancelButtonOnClick = 'THEME_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK',
  OkButtonOnClick = 'THEME_CREATE_DIALOG_OK_BUTTON_ON_CLICK',
}

/**
 * Union of actions handled by the Create Theme Dialog.
 */
export type CreateThemeDialogActions =
  | { type: CreateThemeDialogActionType.NameTextOnChange; value: string }
  | { type: CreateThemeDialogActionType.CancelButtonOnClick }
  | { type: CreateThemeDialogActionType.OkButtonOnClick; params: { name: ThemeName } };


const createThemeDialogTypes = new Set<string>(Object.values(CreateThemeDialogActionType));

/**
 * Returns whether the app action belongs to the Create Theme Dialog.
 * @param a Input for this call.
 */
export function isCreateThemeDialogAction(a: AppAction): a is CreateThemeDialogActions {
  return createThemeDialogTypes.has(a.type);
}

const createThemeDialogCoalescers: Partial<Record<CreateThemeDialogActionType, ActionCoalesceFn>> = {
  [CreateThemeDialogActionType.NameTextOnChange]: coalesceLatest,
};

/**
 * Coalesces consecutive Create Theme Dialog actions when the action queue merges duplicate streams.
 * @param pending Input for this call.
 * @param incoming Input for this call.
 * @returns Coalesced action, or null when coalescing does not apply.
 */
export function tryCoalesceCreateThemeDialogAction(
  pending: CreateThemeDialogActions,
  incoming: CreateThemeDialogActions,
): CreateThemeDialogActions | null {
  const coalesce = createThemeDialogCoalescers[pending.type];
  return coalesce ? (coalesce(pending, incoming) as CreateThemeDialogActions) : null;
}
