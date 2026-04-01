import { singleton } from 'tsyringe';
import { SetAssignColorDraftTextOperation } from '../../../operations/theme-operations';

@singleton()
export class SetAssignColorDraftTextController {
  constructor(private readonly setAssignColorDraftText: SetAssignColorDraftTextOperation) {}

  run(value: string): void {
    this.setAssignColorDraftText.execute(value);
  }
}
