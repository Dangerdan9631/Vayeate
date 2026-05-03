import { singleton } from 'tsyringe';
import type { ContrastVariableKey } from '../../../../model/schema/primitives';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

@singleton()
export class SetTemplateMappingContrastVariableFilterOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  execute(values: ContrastVariableKey[]): void {
    this.templateUiStore.getStore().setMappingContrastVariableFilter(values);
  }
}



