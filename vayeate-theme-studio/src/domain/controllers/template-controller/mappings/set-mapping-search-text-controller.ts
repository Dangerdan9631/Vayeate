import { singleton } from 'tsyringe';
import { SetTemplateMappingSearchTextOperation } from '../../../operations/template-operations/mappings/set-template-mapping-search-text-operation';

@singleton()
export class SetMappingSearchTextController {
  constructor(private readonly setTemplateMappingSearchText: SetTemplateMappingSearchTextOperation) {}

  run(value: string): void {
    this.setTemplateMappingSearchText.execute(value);
  }
}
