import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

/** Store draft value for the "add group" name input. */
@singleton()
export class SetTemplateAddGroupNameOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  execute(value: string): void {
    this.templateUiStore.getStore().setAddGroupName(value);
  }
}

