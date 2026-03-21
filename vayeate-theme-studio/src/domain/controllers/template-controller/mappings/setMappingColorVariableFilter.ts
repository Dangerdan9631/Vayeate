import type { ColorVariableKey } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetTemplateMappingColorVariableFilter } from '../../../operations/template-operations';

@singleton()
export class SetMappingColorVariableFilterController {
  constructor(
    private readonly setTemplateMappingColorVariableFilter: SetTemplateMappingColorVariableFilter,
  ) {}

  run(values: ColorVariableKey[]): void {
    this.setTemplateMappingColorVariableFilter.execute(values);
  }
}
