import type { TemplateReference } from '../../../../model/schemas';
import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetSelectedTemplateRefOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(ref: TemplateReference | null): void {
    this.appStateSetter.apply({ type: 'SET_SELECTED_TEMPLATE_REF', ref });
  }
}



