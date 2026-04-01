import type { Mapping } from '../../../../model/schemas';
import {
  formatSemanticSelector,
  SEMANTIC_WILDCARD_TYPE,
} from '../../../utils/semantic-token';
import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
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
    private readonly appStateGetter: AppStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly generateSemanticVariantKey: GenerateSemanticVariantKeyOperation,
    private readonly mergeSemanticTokenSets: MergeSemanticTokenSetsOperation,
    private readonly appendSemanticVariantToTemplate: AppendSemanticVariantToTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(
    type: string,
    modifiers: string[],
    language: string | null,
    defaultGroupRef?: string | null,
  ): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const baseMapping = base.mappings.find(
      (m) => m.token.type === 'semantic token' && m.token.key === type,
    );
    let key: string;
    if (modifiers.length === 0 && (language === null || (language && language.trim() === ''))) {
      key = this.generateSemanticVariantKey.execute(type);
    } else {
      key = formatSemanticSelector(type, modifiers, language);
      if (!key) return;
      const existing = template.mappings.some(
        (m) => m.token.type === 'semantic token' && m.token.key === key,
      );
      if (existing) return;
    }
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
    const sets = this.mergeSemanticTokenSets.execute(base, modifiers, language);
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
