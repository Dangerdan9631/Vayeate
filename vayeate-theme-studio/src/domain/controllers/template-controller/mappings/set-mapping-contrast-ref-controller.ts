import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import {
  BumpTemplateVersionForEditOperation,
  SaveTemplateOperation,
  SetMappingContrastRefOperation as SetMappingContrastRefOp,
} from '../../../operations/template-operations';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations';

@singleton()
export class SetMappingContrastRefController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly setMappingContrastRefOp: SetMappingContrastRefOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(
    tokenKey: string,
    tokenType: TokenType,
    contrastVariableRef: string | null,
  ): Promise<void> {
    const template = this.templatesStateGetter.current().template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.setMappingContrastRefOp.execute(base, tokenKey, tokenType, contrastVariableRef);
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
