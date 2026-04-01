import { formatSemanticSelector, parseSemanticSelector } from '../../../utils/semantic-token';
import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  BumpTemplateVersionForEditOperation,
  MergeSemanticTokenSetsOperation,
  SaveTemplateOperation,
  UpdateSemanticVariantKeyInTemplateOperation,
} from '../../../operations/template-operations';
import { TemplateSharedFlows } from '../shared-flows';

@singleton()
export class UpdateSemanticVariantKeyController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly mergeSemanticTokenSets: MergeSemanticTokenSetsOperation,
    private readonly updateSemanticVariantKeyInTemplate: UpdateSemanticVariantKeyInTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(
    oldKey: string,
    modifiers: string[],
    language: string | null,
  ): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    if (!template) return;
    let parsed: { type: string; modifiers: string[]; language: string | null };
    try {
      parsed = parseSemanticSelector(oldKey);
    } catch {
      return;
    }
    const newKey = formatSemanticSelector(parsed.type, modifiers, language);
    if (!newKey || newKey === oldKey) return;
    if (newKey === parsed.type) return;
    const existing = template.mappings.some(
      (m) => m.token.type === 'semantic token' && m.token.key === newKey,
    );
    if (existing) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const sets = this.mergeSemanticTokenSets.execute(base, modifiers, language);
    const next = this.updateSemanticVariantKeyInTemplate.execute(
      base,
      oldKey,
      newKey,
      sets.semanticTokenModifiers,
      sets.semanticTokenLanguages,
    );
    await this.saveTemplate.execute(next);
    await this.templateSharedFlows.refreshRefsAndSelect(next.name, next.version);
  }
}
