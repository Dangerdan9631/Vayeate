import { singleton } from 'tsyringe';
import { SetThemePreviewSelectedSampleKey } from '../../../operations/theme-operations';

@singleton()
export class SetPreviewSelectedSampleController {
  constructor(private readonly setThemePreviewSelectedSampleKey: SetThemePreviewSelectedSampleKey) {}

  run(value: string): void {
    this.setThemePreviewSelectedSampleKey.execute(value);
  }
}
