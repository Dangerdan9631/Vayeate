import type { Version } from '../../../../model/schemas';
import type { SetState } from '../../../operations/theme-operations';
import type { GetState } from '../../../operations/undo-operations';
import { setThemeTemplate } from './setThemeTemplate';

/** Set template version for current theme (THEME_DETAILS_CATALOG_VERSION_LIST = template version). */
export async function setThemeTemplateVersionOnly(
  setState: SetState,
  getState: GetState,
  version: Version,
): Promise<void> {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme?.templateRef) return;
  await setThemeTemplate(setState, getState, theme.templateRef.name, version);
}


