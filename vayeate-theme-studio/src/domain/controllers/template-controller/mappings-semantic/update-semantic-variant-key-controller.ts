import {
  formatSemanticSelector,
  parseSemanticSelector,
  type ParsedSemanticSelector,
} from '../../../utils/semantic-token';
import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
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
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly mergeSemanticTokenSets: MergeSemanticTokenSetsOperation,
    private readonly updateSemanticVariantKeyInTemplate: UpdateSemanticVariantKeyInTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async runAfterModifierChange(oldKey: string, modifiers: string[]): Promise<void> {
    let parsed: ParsedSemanticSelector;
    try {
      parsed = parseSemanticSelector(oldKey);
    } catch {
      return;
    }
    await this.runFromParsed(oldKey, parsed, modifiers, parsed.language);
  }

  async runAfterLanguageChange(oldKey: string, language: string | null): Promise<void> {
    let parsed: ParsedSemanticSelector;
    try {
      parsed = parseSemanticSelector(oldKey);
    } catch {
      return;
    }
    await this.runFromParsed(oldKey, parsed, parsed.modifiers, language);
  }

  private async runFromParsed(
    oldKey: string,
    parsed: ParsedSemanticSelector,
    modifiers: string[],
    language: string | null,
  ): Promise<void> {
    const template = this.templatesStateGetter.current().template;
    if (!template) return;
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
