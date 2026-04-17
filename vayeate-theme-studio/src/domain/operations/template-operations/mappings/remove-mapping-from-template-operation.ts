import { singleton } from 'tsyringe';
import type { TokenType } from '../../../../model/schema/primitives';
import type { Template } from '../../../../model/schema/template-schemas';

@singleton()
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
