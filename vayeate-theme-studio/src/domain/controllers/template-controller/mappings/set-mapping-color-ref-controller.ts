import type { ColorVariableKey } from '../../../../model/schemas';
import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import { isMappingOrphanForTemplate } from '../../../utils/orphan-mappings';
import {
  BumpTemplateVersionForEditOperation,
  RemoveMappingFromTemplateOperation,
  SaveTemplateOperation,
  SetMappingColorRefOperation as SetMappingColorRefOp,
} from '../../../operations/template-operations';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations';

@singleton()
export class SetMappingColorRefController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly removeMappingFromTemplate: RemoveMappingFromTemplateOperation,
    private readonly setMappingColorRefOp: SetMappingColorRefOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(
    tokenKey: string,
    tokenType: TokenType,
    colorRef: ColorVariableKey | null,
  ): Promise<void> {
    const template = this.templatesStateGetter.current().template;
    if (!template) return;
    const loadedForDisplay = this.catalogsStateGetter.current().loadedForDisplay;
    const isOrphan = isMappingOrphanForTemplate(
      template,
      tokenKey,
      tokenType,
      loadedForDisplay,
    );
    const base = this.bumpTemplateVersionForEdit.execute(template);
    if (colorRef === null && isOrphan) {
      const next = this.removeMappingFromTemplate.execute(base, tokenKey, tokenType);
      await this.saveTemplate.execute(next);
      await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
      return;
    }
    const next = this.setMappingColorRefOp.execute(base, tokenKey, tokenType, colorRef);
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
