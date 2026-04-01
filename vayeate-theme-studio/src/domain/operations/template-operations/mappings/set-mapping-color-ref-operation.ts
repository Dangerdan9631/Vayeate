import { injectable } from 'tsyringe';
import type { Template, TokenType } from '../../../../model/schemas';

@injectable()
export class SetMappingColorRefOperation {
  execute(
    template: Template,
    tokenKey: string,
    tokenType: TokenType,
    colorVariableRef: string | null,
  ): Template {
    return {
      ...template,
      mappings: template.mappings.map((m) =>
        m.token.key === tokenKey && m.token.type === tokenType ? { ...m, colorVariableRef } : m,
      ),
    };
  }
}
