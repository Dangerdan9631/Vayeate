import { singleton } from 'tsyringe';
import { SetTemplateMappingSearchText } from '../../../operations/template-operations';

@singleton()
export class SetMappingSearchTextController {
  constructor(private readonly setTemplateMappingSearchText: SetTemplateMappingSearchText) {}

  run(value: string): void {
    this.setTemplateMappingSearchText.execute(value);
  }
}
