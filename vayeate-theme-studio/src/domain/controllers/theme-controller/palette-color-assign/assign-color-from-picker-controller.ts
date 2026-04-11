import { singleton } from 'tsyringe';
import { CommitAssignColorTextOperation } from '../../../operations/theme-operations/palette-color-assign/commit-assign-color-text-operation';

@singleton()
export class AssignColorFromPickerController {
  constructor(private readonly commitAssignColorText: CommitAssignColorTextOperation) {}

  async run(hex: string, _ref?: string): Promise<void> {
    this.commitAssignColorText.execute(hex);
  }
}
