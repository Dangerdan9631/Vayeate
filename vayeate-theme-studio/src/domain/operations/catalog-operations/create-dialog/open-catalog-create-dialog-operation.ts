import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class OpenCatalogCreateDialogOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(): void {
    this.appStateSetter.apply({ type: 'SET_CREATE_DIALOG_OPEN', value: true });
  }
}
