import { singleton } from 'tsyringe';
import { CommitAssignColorTextOperation } from '../../../../domain/operations/theme-operations/palette-color-assign/commit-assign-color-text-operation';
import type { HexColor } from '../../../../model/schema/primitives';

@singleton()
export class CommitAssignColorEyeDropperController {
  constructor(
    private readonly commitAssignColorText: CommitAssignColorTextOperation,
  ) {}

  async run(value: HexColor): Promise<void> {
    this.commitAssignColorText.execute(value);
  }
}
