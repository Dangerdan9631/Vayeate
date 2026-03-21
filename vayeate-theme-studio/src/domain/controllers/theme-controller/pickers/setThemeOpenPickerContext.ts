import { singleton } from 'tsyringe';
import { SetThemeOpenPickerContext } from '../../../operations/theme-operations';

/** Set the active color picker context key (identifies which picker is open). Pass null to close. */
@singleton()
export class SetThemeOpenPickerContextController {
  constructor(private readonly setThemeOpenPickerContext: SetThemeOpenPickerContext) {}

  run(context: string | null): void {
    this.setThemeOpenPickerContext.execute(context);
  }
}
