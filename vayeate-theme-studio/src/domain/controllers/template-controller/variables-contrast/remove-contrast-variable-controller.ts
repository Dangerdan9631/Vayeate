import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  BumpTemplateVersionForEditOperation,
  RemoveContrastVariableOperation as RemoveContrastVariableOp,
  SaveTemplateOperation,
} from '../../../operations/template-operations';
import { referencedContrastVarKeysFromTemplate } from '../../../utils/template-utils';
import { TemplateSharedFlows } from '../shared-flows';

@singleton()
export class RemoveContrastVariableController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly removeContrastVariableFromTemplate: RemoveContrastVariableOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(key: string): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    if (!template) return;
    const refs = referencedContrastVarKeysFromTemplate(template);
    if (refs.has(key)) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.removeContrastVariableFromTemplate.execute(base, key);
    await this.saveTemplate.execute(next);
    await this.templateSharedFlows.refreshRefsAndSelect(next.name, next.version);
  }
}
