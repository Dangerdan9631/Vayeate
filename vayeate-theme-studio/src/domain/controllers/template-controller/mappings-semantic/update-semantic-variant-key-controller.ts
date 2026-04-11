import {
  formatSemanticSelector,
  parseSemanticSelector,
  type ParsedSemanticSelector,
} from '../../../utils/semantic-token';
import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import { BumpTemplateVersionForEditOperation } from '../../../operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { MergeSemanticTokenSetsOperation } from '../../../operations/template-operations/mappings-semantic/merge-semantic-token-sets-operation';
import { SaveTemplateOperation } from '../../../operations/template-operations/template-details/save-template-operation';
import { UpdateSemanticVariantKeyInTemplateOperation } from '../../../operations/template-operations/mappings-semantic/update-semantic-variant-key-in-template-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-and-select-operation';

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
