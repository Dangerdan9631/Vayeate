import type { TemplateName, ThemeName, TokenKey, Version } from '../../../../../model/schema/primitives';
import type { ThemePreviewTokenRefField } from '../../../../../model/schema/theme-schemas';
import type { AppAction } from '../../../../core/actions/app-action';

export enum ThemeDetailsCardActionType {
  TemplateListOnCommit = 'THEME_DETAILS_TEMPLATE_LIST_ON_COMMIT',
  TemplateVersionListOnCommit = 'THEME_DETAILS_TEMPLATE_VERSION_LIST_ON_COMMIT',
  DeleteVersionButtonOnClick = 'THEME_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK',
  IncrementVersionButtonOnClick = 'THEME_DETAILS_INCREMENT_VERSION_BUTTON_ON_CLICK',
  GenerateButtonOnClick = 'THEME_DETAILS_GENERATE_BUTTON_ON_CLICK',
  PreviewTokenRefListOnCommit = 'THEME_DETAILS_PREVIEW_TOKEN_REF_LIST_ON_COMMIT',
}

export type ThemeDetailsCardActions =
  | { type: ThemeDetailsCardActionType.TemplateListOnCommit; name: TemplateName; version: Version }
  | { type: ThemeDetailsCardActionType.TemplateVersionListOnCommit; name: TemplateName; version: Version }
  | { type: ThemeDetailsCardActionType.DeleteVersionButtonOnClick; name: ThemeName; version: Version }
  | { type: ThemeDetailsCardActionType.IncrementVersionButtonOnClick }
  | { type: ThemeDetailsCardActionType.GenerateButtonOnClick }
  | {
      type: ThemeDetailsCardActionType.PreviewTokenRefListOnCommit;
      tokenRefField: ThemePreviewTokenRefField;
      value: TokenKey | null;
    };


const themeDetailsCardTypes = new Set<string>(Object.values(ThemeDetailsCardActionType));

export function isThemeDetailsCardAction(a: AppAction): a is ThemeDetailsCardActions {
  return themeDetailsCardTypes.has(a.type);
}
