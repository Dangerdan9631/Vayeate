import { injectable } from 'tsyringe';
import type { Template, TokenType } from '../../../../model/schemas';

@injectable()
export class RemoveMappingFromTemplateOperation {
  execute(
    template: Template,
    tokenKey: string,
    tokenType: TokenType,
  ): Template {
    return {
      ...template,
      mappings: template.mappings.filter(
        (m) => !(m.token.key === tokenKey && m.token.type === tokenType),
      ),
    };
  }
}
