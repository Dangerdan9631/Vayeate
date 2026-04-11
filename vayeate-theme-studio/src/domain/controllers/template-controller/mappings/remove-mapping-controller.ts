import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import {
  BumpTemplateVersionForEditOperation,
  RemoveMappingFromTemplateOperation,
  SaveTemplateOperation,
} from '../../../operations/template-operations';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations';

@singleton()
export class RemoveMappingController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly removeMappingFromTemplate: RemoveMappingFromTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(tokenKey: string, tokenType: TokenType): Promise<void> {
    const template = this.templatesStateGetter.current().template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.removeMappingFromTemplate.execute(base, tokenKey, tokenType);
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
