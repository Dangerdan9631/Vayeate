import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import { CommitAssignColorTextController } from './commit-assign-color-text-controller';

/** Apply current assign-color draft text if valid (e.g. assign button click). */
@singleton()
export class ApplyAssignColorDraftController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly commitAssignColorText: CommitAssignColorTextController,
  ) {}

  run(): void {
    const draft = this.appStateGetter.current().themes.assignColorDraftText;
    if (!draft.trim()) return;
    this.commitAssignColorText.run(draft);
  }
}
