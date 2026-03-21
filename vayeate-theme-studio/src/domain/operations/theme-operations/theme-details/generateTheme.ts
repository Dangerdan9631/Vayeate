import { ThemeService } from '../../../../gateway/services/theme-service';
import { container, injectable } from 'tsyringe';
import { SetGenerateResult } from './setGenerateResult';
import type { AppStateUpdate } from '../../../state/app-state';

/** Generate theme files via service and report result in state. */
@injectable()
export class GenerateTheme {
  constructor(
    private readonly setGenerateResult: SetGenerateResult,
    private readonly themeService: ThemeService,
  ) {}

  async execute(
    themeName: string,
    themeVersion: string,
    templateName: string,
    templateVersion: string,
  ): Promise<void> {
    this.setGenerateResult.execute(null);
    try {
      const { darkPath, lightPath } = await this.themeService.generateTheme(
        themeName,
        themeVersion,
        templateName,
        templateVersion,
      );
      this.setGenerateResult.execute({
        success: true,
        message: `Generated ${darkPath} and ${lightPath}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setGenerateResult.execute({ success: false, message });
    }
  }
}

/** @deprecated Use GenerateTheme class instead. */
export async function generateTheme(
  setState: (update: AppStateUpdate) => void,
  themeName: string,
  themeVersion: string,
  templateName: string,
  templateVersion: string,
): Promise<void> {
  setState({ type: 'SET_GENERATE_RESULT', result: null });
  try {
    const { darkPath, lightPath } = await container.resolve(ThemeService).generateTheme(
      themeName,
      themeVersion,
      templateName,
      templateVersion,
    );
    setState({
      type: 'SET_GENERATE_RESULT',
      result: { success: true, message: `Generated ${darkPath} and ${lightPath}` },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setState({ type: 'SET_GENERATE_RESULT', result: { success: false, message } });
  }
}
