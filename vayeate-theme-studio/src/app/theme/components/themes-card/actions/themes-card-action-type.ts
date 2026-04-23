import type { ThemeName, Version } from '../../../../../model/schema/primitives';
import type { AppAction } from '../../../../core/actions/app-action';

export enum ThemesCardActionType {
  NameListOnCommit = 'THEME_THEMES_NAME_LIST_ON_COMMIT',
  VersionListOnCommit = 'THEME_THEMES_VERSION_LIST_ON_COMMIT',
  CreateButtonOnClick = 'THEME_THEMES_CREATE_BUTTON_ON_CLICK',
}

export type ThemesCardActions =
  | { type: ThemesCardActionType.NameListOnCommit; name: ThemeName }
  | { type: ThemesCardActionType.VersionListOnCommit; name: ThemeName; version: Version }
  | { type: ThemesCardActionType.CreateButtonOnClick };


const themesCardTypes = new Set<string>(Object.values(ThemesCardActionType));

export function isThemesCardAction(a: AppAction): a is ThemesCardActions {
  return themesCardTypes.has(a.type);
}
