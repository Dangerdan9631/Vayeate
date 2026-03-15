import type { TemplateName, Version } from '../../../model/schemas';
import { setTheme, type SetState } from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { templateService } from '../../../gateway/services/template-service';
import { mergeAssignmentsFromTemplate } from '../../utils/theme-template-merge';
import { saveTheme } from './saveTheme';

export async function setThemeTemplate(
  setState: SetState,
  getState: GetState,
  name: TemplateName,
  version: Version,
): Promise<void> {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme) return;
  const template = await templateService.loadTemplate(name, version);
  if (!template) return;
  const merged = mergeAssignmentsFromTemplate(theme, template);
  setTheme(setState, merged);
  saveTheme(setState, merged);
  setState({ type: 'SET_THEME_LOADED_TEMPLATE', template });
}
