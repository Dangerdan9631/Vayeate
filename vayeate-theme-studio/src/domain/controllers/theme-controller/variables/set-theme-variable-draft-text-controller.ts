import { singleton } from 'tsyringe';
import { SetThemeVariableDraftTextOperation } from '../../../operations/theme-operations';

/** Store a draft text value for in-progress variable edits (for validation display). */
@singleton()
export class SetThemeVariableDraftTextController {
  constructor(private readonly setThemeVariableDraftText: SetThemeVariableDraftTextOperation) {}

  run(key: string, value: string): void {
    this.setThemeVariableDraftText.execute(key, value);
  }
}
