import { singleton } from 'tsyringe';
import { SetTemplateMappingTokenGroupSelection } from '../../../operations/template-operations';

@singleton()
export class SetMappingTokenGroupSelectionController {
  constructor(
    private readonly setTemplateMappingTokenGroupSelection: SetTemplateMappingTokenGroupSelection,
  ) {}

  run(value: string): void {
    this.setTemplateMappingTokenGroupSelection.execute(value);
  }
}
