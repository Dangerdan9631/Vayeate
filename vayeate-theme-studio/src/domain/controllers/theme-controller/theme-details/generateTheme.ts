import { generateTheme as generateThemeOp, type SetState } from '../../../operations/theme-operations';

export async function generateTheme(
  setState: SetState,
  themeName: string,
  themeVersion: string,
  templateName: string,
  templateVersion: string,
): Promise<void> {
  await generateThemeOp(setState, themeName, themeVersion, templateName, templateVersion);
}

