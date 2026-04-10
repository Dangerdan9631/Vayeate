import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';

@singleton()
export class SaveThemeController {
  constructor(
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(theme: Theme): void {
    this.applyThemeStateAndSchedulePersist.execute(theme);
  }
}
