import type { Mapping } from '../../../../model/schemas';
import { SEMANTIC_WILDCARD_TYPE } from '../../../utils/semantic-token';
import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';
import { AppendSemanticVariantToTemplateOperation } from '../../../operations/template-operations/mappings-semantic/append-semantic-variant-to-template-operation';
import { BumpTemplateVersionForEditOperation } from '../../../operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { GenerateSemanticVariantKeyOperation } from '../../../operations/template-operations/mappings-semantic/generate-semantic-variant-key-operation';
import { MergeSemanticTokenSetsOperation } from '../../../operations/template-operations/mappings-semantic/merge-semantic-token-sets-operation';
import { SaveTemplateOperation } from '../../../operations/template-operations/template-details/save-template-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-and-select-operation';

@singleton()
export class AddSemanticVariantController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly generateSemanticVariantKey: GenerateSemanticVariantKeyOperation,
    private readonly mergeSemanticTokenSets: MergeSemanticTokenSetsOperation,
    private readonly appendSemanticVariantToTemplate: AppendSemanticVariantToTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(type: string, defaultGroupRef?: string | null): Promise<void> {
    const template = this.templatesStore.getStore().state.template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const baseMapping = base.mappings.find(
      (m) => m.token.type === 'semantic token' && m.token.key === type,
    );
    const key = this.generateSemanticVariantKey.execute(type);
    const groupRef =
      type === SEMANTIC_WILDCARD_TYPE && defaultGroupRef !== undefined
        ? defaultGroupRef
        : (baseMapping?.groupRef ?? null);
    const newMapping: Mapping = {
      token: { key, type: 'semantic token' },
      colorVariableRef: null,
      contrastVariableRef: null,
      groupRef,
    };
    const sets = this.mergeSemanticTokenSets.execute(base, [], null);
    const next = this.appendSemanticVariantToTemplate.execute(
      base,
      newMapping,
      sets.semanticTokenModifiers,
      sets.semanticTokenLanguages,
    );
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
