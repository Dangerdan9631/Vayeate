import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schema/primitives';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class SetTemplateMappingColorVariableFilterOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(values: ColorVariableKey[]): void {
    this.templatesStore.getStore().setMappingColorVariableFilter(values);
  }
}



