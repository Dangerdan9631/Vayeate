import type { ColorVariableKey } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import {
  BumpTemplateVersionForEditOperation,
  SaveTemplateOperation,
  UpdateContrastComparisonSourceOperation as UpdateContrastComparisonSourceOp,
} from '../../../operations/template-operations';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations';

@singleton()
export class UpdateContrastComparisonSourceController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly updateContrastComparisonSourceOp: UpdateContrastComparisonSourceOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(
    contrastVariableKey: string,
    comparisonSourceRef: ColorVariableKey | null,
  ): Promise<void> {
    const template = this.templatesStateGetter.current().template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.updateContrastComparisonSourceOp.execute(
      base,
      contrastVariableKey,
      comparisonSourceRef,
    );
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
