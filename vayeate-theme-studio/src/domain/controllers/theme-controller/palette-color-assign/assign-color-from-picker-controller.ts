import { singleton } from 'tsyringe';
import { CommitAssignColorTextOperation } from '../../../operations/theme-operations';

@singleton()
export class AssignColorFromPickerController {
  constructor(private readonly commitAssignColorText: CommitAssignColorTextOperation) {}

  run(hex: string, _ref?: string): void {
    this.commitAssignColorText.execute(hex);
  }
}
