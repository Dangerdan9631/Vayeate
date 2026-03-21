import { singleton } from 'tsyringe';
import { SetThemeVariableDraftText } from '../../../operations/theme-operations';

/** Store a draft text value for in-progress variable edits (for validation display). */
@singleton()
export class SetThemeVariableDraftTextController {
  constructor(private readonly setThemeVariableDraftText: SetThemeVariableDraftText) {}

  run(key: string, value: string): void {
    this.setThemeVariableDraftText.execute(key, value);
  }
}
