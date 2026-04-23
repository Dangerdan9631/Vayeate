import type { ThemeName, Version } from '../../../../../model/schema/primitives';

export enum ThemesCardActionType {
  NameListOnCommit = 'THEME_THEMES_NAME_LIST_ON_COMMIT',
  VersionListOnCommit = 'THEME_THEMES_VERSION_LIST_ON_COMMIT',
  CreateButtonOnClick = 'THEME_THEMES_CREATE_BUTTON_ON_CLICK',
}

export type ThemesCardActions =
  | { type: ThemesCardActionType.NameListOnCommit; name: ThemeName }
  | { type: ThemesCardActionType.VersionListOnCommit; name: ThemeName; version: Version }
  | { type: ThemesCardActionType.CreateButtonOnClick };
