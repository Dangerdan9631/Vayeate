import type { Mapping } from '../../../../model/schemas';
import { SEMANTIC_WILDCARD_TYPE } from '../../../utils/semantic-token';
import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import {
  AppendSemanticVariantToTemplateOperation,
  BumpTemplateVersionForEditOperation,
  GenerateSemanticVariantKeyOperation,
  MergeSemanticTokenSetsOperation,
  SaveTemplateOperation,
} from '../../../operations/template-operations';
import { TemplateSharedFlows } from '../shared-flows';

@singleton()
export class AddSemanticVariantController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly generateSemanticVariantKey: GenerateSemanticVariantKeyOperation,
    private readonly mergeSemanticTokenSets: MergeSemanticTokenSetsOperation,
    private readonly appendSemanticVariantToTemplate: AppendSemanticVariantToTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(type: string, defaultGroupRef?: string | null): Promise<void> {
    const template = this.templatesStateGetter.current().template;
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
    await this.templateSharedFlows.refreshRefsAndSelect(next.name, next.version);
  }
}
