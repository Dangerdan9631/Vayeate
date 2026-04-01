import type { ColorVariableKey } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  BumpTemplateVersionForEditOperation,
  SaveTemplateOperation,
  UpdateContrastComparisonSourceOperation as UpdateContrastComparisonSourceOp,
} from '../../../operations/template-operations';
import { TemplateSharedFlows } from '../shared-flows';

@singleton()
export class UpdateContrastComparisonSourceController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly updateContrastComparisonSourceOp: UpdateContrastComparisonSourceOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(
    contrastVariableKey: string,
    comparisonSourceRef: ColorVariableKey | null,
  ): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.updateContrastComparisonSourceOp.execute(
      base,
      contrastVariableKey,
      comparisonSourceRef,
    );
    await this.saveTemplate.execute(next);
    await this.templateSharedFlows.refreshRefsAndSelect(next.name, next.version);
  }
}
