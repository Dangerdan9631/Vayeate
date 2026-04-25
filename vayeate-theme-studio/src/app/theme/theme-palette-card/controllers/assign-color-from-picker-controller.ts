import { singleton } from 'tsyringe';
import { CommitAssignColorTextOperation } from '../../../../domain/operations/theme-operations/palette-color-assign/commit-assign-color-text-operation';

@singleton()
export class AssignColorFromPickerController {
  constructor(private readonly commitAssignColorText: CommitAssignColorTextOperation) {}

  run(hex: string, _ref?: string): void {
    this.commitAssignColorText.execute(hex);
  }
}
