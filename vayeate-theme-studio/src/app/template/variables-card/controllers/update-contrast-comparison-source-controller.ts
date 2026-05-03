import type { ColorVariableKey } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/template/templates-store';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { UpdateContrastComparisonSourceOperation as UpdateContrastComparisonSourceOp } from '../../../../domain/operations/template-operations/variables-contrast/update-contrast-comparison-source-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';

@singleton()
export class UpdateContrastComparisonSourceController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly updateContrastComparisonSourceOp: UpdateContrastComparisonSourceOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(
    contrastVariableKey: string,
    comparisonSourceRef: ColorVariableKey | null,
  ): Promise<void> {
    const template = getCurrentTemplate(this.templatesStore.getStore());
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.updateContrastComparisonSourceOp.execute(
      base,
      contrastVariableKey,
      comparisonSourceRef,
    );
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
