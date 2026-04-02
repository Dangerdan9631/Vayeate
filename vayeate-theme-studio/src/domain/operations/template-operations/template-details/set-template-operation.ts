import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

@injectable()
export class SetTemplateOperation {
  constructor(private readonly TemplatesStateSetter: TemplatesStateSetter) {}

  execute(template: Template | null): void {
    this.TemplatesStateSetter.apply({ type: 'SET_TEMPLATE', template });
  }
}



