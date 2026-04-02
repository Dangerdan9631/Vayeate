import type { TemplateReference } from '../../../../model/schemas';
import { injectable } from 'tsyringe';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

@injectable()
export class SetSelectedTemplateRefOperation {
  constructor(private readonly TemplatesStateSetter: TemplatesStateSetter) {}

  execute(ref: TemplateReference | null): void {
    this.TemplatesStateSetter.apply({ type: 'SET_SELECTED_TEMPLATE_REF', ref });
  }
}



