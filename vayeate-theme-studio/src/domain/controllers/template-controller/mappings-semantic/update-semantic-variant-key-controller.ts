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
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations';

export type UpdateSemanticVariantKeyPayload =
  | { variant: 'modifier'; tokenKey: string; modifiers: string[] }
  | { variant: 'language'; tokenKey: string; language: string | null };

@singleton()
export class UpdateSemanticVariantKeyController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly mergeSemanticTokenSets: MergeSemanticTokenSetsOperation,
    private readonly updateSemanticVariantKeyInTemplate: UpdateSemanticVariantKeyInTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(payload: UpdateSemanticVariantKeyPayload): Promise<void> {
    let parsed: ParsedSemanticSelector;
    try {
      parsed = parseSemanticSelector(payload.tokenKey);
    } catch {
      return;
    }
    if (payload.variant === 'modifier') {
      await this.runFromParsed(payload.tokenKey, parsed, payload.modifiers, parsed.language);
    } else {
      await this.runFromParsed(payload.tokenKey, parsed, parsed.modifiers, payload.language);
    }
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
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
