import { singleton } from 'tsyringe';
import type { Mapping, Template } from '../../../../model/schema/template-schemas';

/**
 * Appends semantic variant to template to the template or catalog in the store.
 */

@singleton()
export class AppendSemanticVariantToTemplateOperation {

  /**
   * Runs the append semantic variant to template mutation.
   * @param template Template (Template).
   * @param mapping Mapping (Mapping).
   * @param semanticTokenModifiers Semantic token modifiers (readonly string[]).
   * @param semanticTokenLanguages Semantic token languages (readonly string[]).
   * @returns Template result.
   */
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
