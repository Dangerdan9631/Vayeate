import { singleton } from 'tsyringe';
import { SetTemplateMappingSearchTextOperation } from '../../../operations/template-operations';

@singleton()
export class SetMappingSearchTextController {
  constructor(private readonly setTemplateMappingSearchText: SetTemplateMappingSearchTextOperation) {}

  run(value: string): void {
    this.setTemplateMappingSearchText.execute(value);
  }
}
