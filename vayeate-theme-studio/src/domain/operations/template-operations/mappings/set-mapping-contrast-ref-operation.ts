import { singleton } from 'tsyringe';
import type { Template, TokenType } from '../../../../model/schemas';

@singleton()
export class SetMappingContrastRefOperation {
  execute(
    template: Template,
    tokenKey: string,
    tokenType: TokenType,
    contrastVariableRef: string | null,
  ): Template {
    return {
      ...template,
      mappings: template.mappings.map((m) =>
        m.token.key === tokenKey && m.token.type === tokenType ? { ...m, contrastVariableRef } : m,
      ),
    };
  }
}
