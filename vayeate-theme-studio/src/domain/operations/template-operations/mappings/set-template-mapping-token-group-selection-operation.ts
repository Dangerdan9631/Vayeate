import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetTemplateMappingTokenGroupSelectionOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: string): void {
    this.appStateSetter.apply({ type: 'SET_TEMPLATE_MAPPING_TOKEN_GROUP_SELECTION', value });
  }
}

