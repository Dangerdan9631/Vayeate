import { singleton } from 'tsyringe';
import { SetAssignColorDraftText } from '../../../operations/theme-operations';

@singleton()
export class SetAssignColorDraftTextController {
  constructor(private readonly setAssignColorDraftText: SetAssignColorDraftText) {}

  run(value: string): void {
    this.setAssignColorDraftText.execute(value);
  }
}
