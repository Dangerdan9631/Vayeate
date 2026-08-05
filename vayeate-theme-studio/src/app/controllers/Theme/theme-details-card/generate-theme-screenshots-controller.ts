import { singleton } from 'tsyringe';
import { CloseMenusOperation } from '../../../../domain/operations/Common/app-operations/close-menus-operation';
import { EnqueueBackgroundQueueActionOperation } from '../../../../domain/operations/Queue/background-queue/enqueue-background-queue-action-operation';
import { GenerateThemeScreenshotsOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/generate-theme-screenshots-operation';
import { SetGenerateResultOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/set-generate-result-operation';

/**
 * Schedules dark and light screenshot generation for every latest theme file.
 */
@singleton()
export class GenerateThemeScreenshotsController {
  constructor(
    private readonly closeMenus: CloseMenusOperation,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
    private readonly generateThemeScreenshots: GenerateThemeScreenshotsOperation,
    private readonly setGenerateResult: SetGenerateResultOperation,
  ) {}

  /**
   * Closes the menu and schedules serial offscreen capture work.
   */
  run(): void {
    this.closeMenus.execute();
    this.setGenerateResult.execute(null);
    this.enqueueBackgroundAction.execute(
      'main',
      'Generating theme screenshots',
      async () => {
        const result = await this.generateThemeScreenshots.execute();
        this.setGenerateResult.execute({ success: result.success, message: result.message });
      },
    );
  }
}
