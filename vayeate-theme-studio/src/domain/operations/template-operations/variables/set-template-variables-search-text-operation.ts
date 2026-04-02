import { injectable } from 'tsyringe';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

@injectable()
export class SetTemplateVariablesSearchTextOperation {
  constructor(private readonly TemplatesStateSetter: TemplatesStateSetter) {}

  execute(value: string): void {
    this.TemplatesStateSetter.apply({ type: 'SET_TEMPLATE_VARIABLES_SEARCH_TEXT', value });
  }
}

