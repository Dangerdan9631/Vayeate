import { setGenerateResult, type SetState } from '../../operations/theme-operations';
import { themeService } from '../../../gateway/services/theme-service';

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
