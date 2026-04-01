import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetTemplateOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(template: Template | null): void {
    this.appStateSetter.apply({ type: 'SET_TEMPLATE', template });
  }
}



