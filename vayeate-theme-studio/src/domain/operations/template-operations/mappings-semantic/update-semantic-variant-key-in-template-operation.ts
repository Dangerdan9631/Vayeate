import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';

@injectable()
export class UpdateSemanticVariantKeyInTemplateOperation {
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
