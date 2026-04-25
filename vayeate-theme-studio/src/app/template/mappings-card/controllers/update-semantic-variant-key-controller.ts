import { formatSemanticSelector } from '../../../../model/format-semantic-selector';
import { parseSemanticSelector } from '../../../../model/parse-semantic-selector';
import { ParsedSemanticSelector } from '../../../../model/semantic-selector-types';
import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../../domain/state/template/templates-store';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { MergeSemanticTokenSetsOperation } from '../../../../domain/operations/template-operations/mappings-semantic/merge-semantic-token-sets-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { UpdateSemanticVariantKeyInTemplateOperation } from '../../../../domain/operations/template-operations/mappings-semantic/update-semantic-variant-key-in-template-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';

export type UpdateSemanticVariantKeyPayload =
  | { variant: 'modifier'; tokenKey: string; modifiers: string[] }
  | { variant: 'language'; tokenKey: string; language: string | null };

@singleton()
export class UpdateSemanticVariantKeyController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly mergeSemanticTokenSets: MergeSemanticTokenSetsOperation,
    private readonly updateSemanticVariantKeyInTemplate: UpdateSemanticVariantKeyInTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  run(payload: UpdateSemanticVariantKeyPayload): void {
    let parsed: ParsedSemanticSelector;
    try {
      parsed = parseSemanticSelector(payload.tokenKey);
    } catch {
      return;
    }
    if (payload.variant === 'modifier') {
      this.runFromParsed(payload.tokenKey, parsed, payload.modifiers, parsed.language);
    } else {
      this.runFromParsed(payload.tokenKey, parsed, parsed.modifiers, payload.language);
    }
  }

  private runFromParsed(
    oldKey: string,
    parsed: ParsedSemanticSelector,
    modifiers: string[],
    language: string | null,
  ): void {
    const template = this.templatesStore.getStore().state.template;
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
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
