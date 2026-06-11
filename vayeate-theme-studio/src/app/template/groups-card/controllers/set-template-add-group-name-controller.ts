import { singleton } from 'tsyringe';
import { SetTemplateAddGroupNameOperation } from '../../../../domain/operations/template-operations/variables/set-template-add-group-name-operation';

/**
 * Handles TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE by updating the add-group input.
 */
@singleton()
export class SetTemplateAddGroupNameController {
  constructor(private readonly setTemplateAddGroupName: SetTemplateAddGroupNameOperation) {}

  /**
   * Stores the in-progress group name in template UI state.
   * @param value Text entered in the add-group field.
   * @returns Nothing; state updates happen in domain operations.
   */
  run(value: string): void {
    this.setTemplateAddGroupName.execute(value);
  }
}
