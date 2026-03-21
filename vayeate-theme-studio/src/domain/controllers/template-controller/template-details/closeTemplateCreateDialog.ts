import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import { SetTemplateCreateFormName } from '../../../operations/template-operations';

@singleton()
export class CloseTemplateCreateDialogController {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly setTemplateCreateFormName: SetTemplateCreateFormName,
  ) {}

  run(): void {
    this.appStateSetter.apply({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: false });
    this.setTemplateCreateFormName.execute('');
  }
}
