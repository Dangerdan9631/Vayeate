import { themeService } from '../../../../gateway/services/theme-service';
import { setGenerateResult } from './setGenerateResult';
import type { SetState } from '../types';

/** Generate theme files via service and report result in state. */
export async function generateTheme(
  setState: SetState,
  themeName: string,
  themeVersion: string,
  templateName: string,
  templateVersion: string,
): Promise<void> {
  setGenerateResult(setState, null);
  try {
    const { darkPath, lightPath } = await themeService.generateTheme(
      themeName,
      themeVersion,
      templateName,
      templateVersion,
    );
    setGenerateResult(setState, {
      success: true,
      message: `Generated ${darkPath} and ${lightPath}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setGenerateResult(setState, { success: false, message });
  }
}



