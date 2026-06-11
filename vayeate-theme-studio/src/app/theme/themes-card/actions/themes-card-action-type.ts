import type { ThemeName, Version } from '../../../../model/schema/primitives';
import type { AppAction } from '../../../core/action-queue/app-action';

/**
 * Action type literals dispatched from the Themes Card.
 */
export enum ThemesCardActionType {
  NameListOnCommit = 'THEME_THEMES_NAME_LIST_ON_COMMIT',
  VersionListOnCommit = 'THEME_THEMES_VERSION_LIST_ON_COMMIT',
  CreateButtonOnClick = 'THEME_THEMES_CREATE_BUTTON_ON_CLICK',
}

/**
 * Union of actions handled by the Themes Card.
 */
export type ThemesCardActions =
  | { type: ThemesCardActionType.NameListOnCommit; name: ThemeName }
  | { type: ThemesCardActionType.VersionListOnCommit; name: ThemeName; version: Version }
  | { type: ThemesCardActionType.CreateButtonOnClick };


const themesCardTypes = new Set<string>(Object.values(ThemesCardActionType));

/**
 * Returns whether the app action belongs to the Themes Card.
 * @param a Input for this call.
 */
export function isThemesCardAction(a: AppAction): a is ThemesCardActions {
  return themesCardTypes.has(a.type);
}
