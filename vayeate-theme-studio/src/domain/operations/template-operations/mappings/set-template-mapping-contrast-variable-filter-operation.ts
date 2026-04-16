import { singleton } from 'tsyringe';
import type { ContrastVariableKey } from '../../../../model/schemas';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class SetTemplateMappingContrastVariableFilterOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(values: ContrastVariableKey[]): void {
    this.templatesStore.getStore().setMappingContrastVariableFilter(values);
  }
}



