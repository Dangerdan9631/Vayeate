import { singleton } from 'tsyringe';
import { SetTemplateMappingSearchTextOperation } from '../../../operations/template-operations/mappings/set-template-mapping-search-text-operation';

@singleton()
export class SetMappingSearchTextController {
  constructor(private readonly setTemplateMappingSearchText: SetTemplateMappingSearchTextOperation) {}

  async run(value: string): Promise<void> {
    this.setTemplateMappingSearchText.execute(value);
  }
}
