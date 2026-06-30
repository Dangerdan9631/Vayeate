import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Updates semantic variant key in template in the store.
 */

@singleton()
export class UpdateSemanticVariantKeyInTemplateOperation {

  /**
   * Runs the update semantic variant key in template mutation.
   * @param template Template (Template).
   * @param oldKey Old key (string).
   * @param newKey New key (string).
   * @param semanticTokenModifiers Semantic token modifiers (readonly string[]).
   * @param semanticTokenLanguages Semantic token languages (readonly string[]).
   * @returns Template result.
   */
  execute(
    template: Template,
    oldKey: string,
    newKey: string,
    semanticTokenModifiers: readonly string[],
    semanticTokenLanguages: readonly string[],
  ): Template {
    return {
      ...template,
      mappings: template.mappings.map((m) =>
        m.token.type === 'semantic token' && m.token.key === oldKey
          ? { ...m, token: { key: newKey, type: 'semantic token' as const } }
          : m,
      ),
      semanticTokenModifiers,
      semanticTokenLanguages,
    };
  }
}
