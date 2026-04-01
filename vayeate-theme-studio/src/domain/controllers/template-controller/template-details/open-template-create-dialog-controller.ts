import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import { SetTemplateCreateFormNameOperation } from '../../../operations/template-operations';

@singleton()
export class OpenTemplateCreateDialogController {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly setTemplateCreateFormName: SetTemplateCreateFormNameOperation,
  ) {}

  run(): void {
    this.setTemplateCreateFormName.execute('');
    this.appStateSetter.apply({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: true });
  }
}
