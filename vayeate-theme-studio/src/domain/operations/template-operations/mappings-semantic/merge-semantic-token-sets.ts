import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';

@injectable()
export class MergeSemanticTokenSets {
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
