import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schema/primitives';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

@singleton()
export class SetTemplateMappingColorVariableFilterOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  execute(values: ColorVariableKey[]): void {
    this.templateUiStore.getStore().setMappingColorVariableFilter(values);
  }
}



