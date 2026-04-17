import { singleton } from 'tsyringe';
import type { Mapping, Template } from '../../../../model/schema/template-schemas';

@singleton()
export class AppendSemanticVariantToTemplateOperation {
  execute(
    template: Template,
    mapping: Mapping,
    semanticTokenModifiers: readonly string[],
    semanticTokenLanguages: readonly string[],
  ): Template {
    return {
      ...template,
      mappings: [...template.mappings, mapping],
      semanticTokenModifiers,
      semanticTokenLanguages,
    };
  }
}
