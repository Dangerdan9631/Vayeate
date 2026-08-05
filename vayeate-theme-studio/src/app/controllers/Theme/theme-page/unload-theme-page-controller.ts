import { singleton } from 'tsyringe';
import { SetThemeFileWatchingOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/set-theme-file-watching-operation';

/**
 * Releases Themes page system integrations when the page unmounts.
 */
@singleton()
export class UnloadThemePageController {
  constructor(private readonly setThemeFileWatching: SetThemeFileWatchingOperation) {}

  /**
   * Stops watching the selected theme file.
   */
  run(): void {
    this.setThemeFileWatching.execute(false);
  }
}
