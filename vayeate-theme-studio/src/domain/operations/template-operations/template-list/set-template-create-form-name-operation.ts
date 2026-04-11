import { singleton } from 'tsyringe';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

@singleton()
export class SetTemplateCreateFormNameOperation {
  constructor(private readonly TemplatesStateSetter: TemplatesStateSetter) {}

  execute(value: string): void {
    this.TemplatesStateSetter.apply({ type: 'SET_TEMPLATE_CREATE_FORM_NAME', value });
  }
}

