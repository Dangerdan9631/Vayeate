import { injectable } from 'tsyringe';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

@injectable()
export class SetTemplateMappingSearchTextOperation {
  constructor(private readonly TemplatesStateSetter: TemplatesStateSetter) {}

  execute(value: string): void {
    this.TemplatesStateSetter.apply({ type: 'SET_TEMPLATE_MAPPING_SEARCH_TEXT', value });
  }
}

