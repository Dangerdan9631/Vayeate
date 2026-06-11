import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Merges semantic token sets into the catalog in the store.
 */

@singleton()
export class MergeSemanticTokenSetsOperation {

  /**
   * Runs the merge semantic token sets mutation.
   * @param template Template (Template).
   * @param modifiers Modifiers (readonly string[]).
   * @param language Language (string | null).
   * @returns Pick<Template, 'semanticTokenModifiers' | 'semanticTokenLanguages'> result.
   */
  execute(
    template: Template,
    modifiers: readonly string[],
    language: string | null,
  ): Pick<Template, 'semanticTokenModifiers' | 'semanticTokenLanguages'> {
    const newModifiers = [...new Set([...(template.semanticTokenModifiers ?? []), ...modifiers])].sort();
    const newLanguages =
      language && language.trim() !== ''
        ? [...new Set([...(template.semanticTokenLanguages ?? []), language.trim()])].sort()
        : (template.semanticTokenLanguages ?? []);
    return { semanticTokenModifiers: newModifiers, semanticTokenLanguages: newLanguages };
  }
}
