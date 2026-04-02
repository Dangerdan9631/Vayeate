import { injectable } from 'tsyringe';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

/** Store draft value for the "add group" name input. */
@injectable()
export class SetTemplateAddGroupNameOperation {
  constructor(private readonly TemplatesStateSetter: TemplatesStateSetter) {}

  execute(value: string): void {
    this.TemplatesStateSetter.apply({ type: 'SET_TEMPLATE_ADD_GROUP_NAME', value });
  }
}

