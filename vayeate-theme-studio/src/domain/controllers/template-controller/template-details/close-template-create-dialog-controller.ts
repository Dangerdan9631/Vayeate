import { singleton } from 'tsyringe';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';
import { SetTemplateCreateFormNameOperation } from '../../../operations/template-operations';

@singleton()
export class CloseTemplateCreateDialogController {
  constructor(
    private readonly templatesStateSetter: TemplatesStateSetter,
    private readonly setTemplateCreateFormName: SetTemplateCreateFormNameOperation,
  ) {}

  run(): void {
    this.templatesStateSetter.apply({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: false });
    this.setTemplateCreateFormName.execute('');
  }
}
