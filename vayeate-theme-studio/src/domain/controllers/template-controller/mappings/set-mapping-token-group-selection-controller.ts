import { singleton } from 'tsyringe';
import { SetTemplateMappingTokenGroupSelectionOperation } from '../../../operations/template-operations';

@singleton()
export class SetMappingTokenGroupSelectionController {
  constructor(
    private readonly setTemplateMappingTokenGroupSelection: SetTemplateMappingTokenGroupSelectionOperation,
  ) {}

  run(value: string): void {
    this.setTemplateMappingTokenGroupSelection.execute(value);
  }
}
