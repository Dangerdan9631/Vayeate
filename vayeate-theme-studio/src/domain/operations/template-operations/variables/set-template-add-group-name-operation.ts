import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';

/** Store draft value for the "add group" name input. */
@singleton()
export class SetTemplateAddGroupNameOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(value: string): void {
    this.templatesStore.getStore().setAddGroupName(value);
  }
}

