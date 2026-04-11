import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import {
  BumpTemplateVersionForEditOperation,
  RemoveColorVariableOperation as RemoveColorVariableOp,
  SaveTemplateOperation,
} from '../../../operations/template-operations';
import { referencedColorVarKeysFromTemplate } from '../../../utils/template-utils';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations';

@singleton()
export class RemoveColorVariableController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly removeColorVariableFromTemplate: RemoveColorVariableOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(key: string): Promise<void> {
    const template = this.templatesStateGetter.current().template;
    if (!template) return;
    const refs = referencedColorVarKeysFromTemplate(template);
    if (refs.has(key)) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.removeColorVariableFromTemplate.execute(base, key);
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
