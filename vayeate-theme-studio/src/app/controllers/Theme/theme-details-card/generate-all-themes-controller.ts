import { singleton } from 'tsyringe';
import { CloseMenusOperation } from '../../../../domain/operations/Common/app-operations/close-menus-operation';
import { EnqueueBackgroundQueueActionOperation } from '../../../../domain/operations/Queue/background-queue/enqueue-background-queue-action-operation';
import { GenerateAllThemesOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/generate-all-themes-operation';
import { SetGenerateResultOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/set-generate-result-operation';

/**
 * Schedules batch generation for the latest version of every theme file.
 */
@singleton()
export class GenerateAllThemesController {
  constructor(
    private readonly closeMenus: CloseMenusOperation,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
    private readonly generateAllThemes: GenerateAllThemesOperation,
    private readonly setGenerateResult: SetGenerateResultOperation,
  ) {}

  /**
   * Closes the menu and schedules the batch as serial persistence work.
   */
  run(): void {
    this.closeMenus.execute();
    this.setGenerateResult.execute(null);
    this.enqueueBackgroundAction.execute(
      'data_io',
      'Generating all themes',
      async () => {
        const result = await this.generateAllThemes.execute();
        this.setGenerateResult.execute({ success: result.success, message: result.message });
      },
    );
  }
}
