import type { ContrastVariableKey } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetTemplateMappingContrastVariableFilter } from '../../../operations/template-operations';

@singleton()
export class SetMappingContrastVariableFilterController {
  constructor(
    private readonly setTemplateMappingContrastVariableFilter: SetTemplateMappingContrastVariableFilter,
  ) {}

  run(values: ContrastVariableKey[]): void {
    this.setTemplateMappingContrastVariableFilter.execute(values);
  }
}
