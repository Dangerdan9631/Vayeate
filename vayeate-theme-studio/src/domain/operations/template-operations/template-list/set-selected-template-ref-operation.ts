import type { TemplateReference } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

@singleton()
export class SetSelectedTemplateRefOperation {
  constructor(private readonly TemplatesStateSetter: TemplatesStateSetter) {}

  execute(ref: TemplateReference | null): void {
    this.TemplatesStateSetter.apply({ type: 'SET_SELECTED_TEMPLATE_REF', ref });
  }
}



