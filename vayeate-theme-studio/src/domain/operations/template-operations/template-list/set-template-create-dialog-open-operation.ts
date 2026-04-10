import { singleton } from 'tsyringe';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

@singleton()
export class SetTemplateCreateDialogOpenOperation {
  constructor(private readonly templatesStateSetter: TemplatesStateSetter) {}

  execute(value: boolean): void {
    this.templatesStateSetter.apply({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value });
  }
}
