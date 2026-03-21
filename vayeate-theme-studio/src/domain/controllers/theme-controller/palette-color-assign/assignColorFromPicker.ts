import { singleton } from 'tsyringe';
import { CommitAssignColorTextController } from './commitAssignColorText';

@singleton()
export class AssignColorFromPickerController {
  constructor(private readonly commitAssignColorText: CommitAssignColorTextController) {}

  run(hex: string, _ref?: string): void {
    this.commitAssignColorText.run(hex);
  }
}
