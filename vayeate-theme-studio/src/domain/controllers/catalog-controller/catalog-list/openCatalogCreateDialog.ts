import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import { SetCatalogCreateFormName, SetCatalogCreateFormType } from '../../../operations/catalog-operations';

@singleton()
export class OpenCatalogCreateDialogController {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly setCatalogCreateFormName: SetCatalogCreateFormName,
    private readonly setCatalogCreateFormType: SetCatalogCreateFormType,
  ) {}

  run(): void {
    this.setCatalogCreateFormName.execute('');
    this.setCatalogCreateFormType.execute('manual');
    this.appStateSetter.apply({ type: 'SET_CREATE_DIALOG_OPEN', value: true });
  }
}
