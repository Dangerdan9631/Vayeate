import { singleton } from 'tsyringe';
import { SetThemePreviewSelectedSampleKeyOperation } from '../../../operations/theme-operations';

@singleton()
export class SetPreviewSelectedSampleController {
  constructor(private readonly setThemePreviewSelectedSampleKey: SetThemePreviewSelectedSampleKeyOperation) {}

  run(value: string): void {
    this.setThemePreviewSelectedSampleKey.execute(value);
  }
}
