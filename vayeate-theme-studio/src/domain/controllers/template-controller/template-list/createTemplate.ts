import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import {
  CreateTemplate,
  RefreshTemplateRefs,
  SetSelectedTemplateRef,
  SetTemplate,
} from '../../../operations/template-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';
import { templateStackId } from '../../../utils/stack-id';

@singleton()
export class CreateTemplateController {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly createTemplate: CreateTemplate,
    private readonly refreshTemplateRefs: RefreshTemplateRefs,
    private readonly setTemplate: SetTemplate,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRef,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
  ) {}

  async run(params: { name: string }): Promise<void> {
    this.appStateSetter.apply({ type: 'SET_TEMPLATE_IS_CREATING', value: true });
    this.appStateSetter.apply({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: false });
    try {
      const newTemplate = await this.createTemplate.execute(params);
      await this.refreshTemplateRefs.execute();
      this.setTemplate.execute(newTemplate);
      this.setSelectedTemplateRef.execute({
        name: newTemplate.name,
        version: newTemplate.version,
      });
      this.setCurrentUndoStackId.execute(
        templateStackId(newTemplate.name, newTemplate.version),
      );
    } finally {
      this.appStateSetter.apply({ type: 'SET_TEMPLATE_IS_CREATING', value: false });
    }
  }
}
