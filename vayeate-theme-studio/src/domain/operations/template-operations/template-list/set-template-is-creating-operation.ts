import { singleton } from 'tsyringe';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

@singleton()
export class SetTemplateIsCreatingOperation {
  constructor(private readonly templatesStateSetter: TemplatesStateSetter) {}

  execute(value: boolean): void {
    this.templatesStateSetter.apply({ type: 'SET_TEMPLATE_IS_CREATING', value });
  }
}
