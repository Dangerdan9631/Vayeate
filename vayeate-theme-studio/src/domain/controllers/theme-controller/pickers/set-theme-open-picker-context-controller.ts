import { singleton } from 'tsyringe';
import { SetThemeOpenPickerContextOperation } from '../../../operations/theme-operations';

/** Set the active color picker context key (identifies which picker is open). Pass null to close. */
@singleton()
export class SetThemeOpenPickerContextController {
  constructor(private readonly setThemeOpenPickerContext: SetThemeOpenPickerContextOperation) {}

  run(context: string | null): void {
    this.setThemeOpenPickerContext.execute(context);
  }
}
