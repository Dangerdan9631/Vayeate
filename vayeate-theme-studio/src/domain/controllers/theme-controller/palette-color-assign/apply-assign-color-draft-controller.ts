import { singleton } from 'tsyringe';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { CommitAssignColorTextController } from './commit-assign-color-text-controller';

/** Apply current assign-color draft text if valid (e.g. assign button click). */
@singleton()
export class ApplyAssignColorDraftController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly commitAssignColorText: CommitAssignColorTextController,
  ) {}

  run(): void {
    const draft = this.themesStateGetter.current().assignColorDraftText;
    if (!draft.trim()) return;
    this.commitAssignColorText.run(draft);
  }
}
