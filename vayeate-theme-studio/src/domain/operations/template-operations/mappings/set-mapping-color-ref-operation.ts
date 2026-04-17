import { singleton } from 'tsyringe';
import type { TokenType } from '../../../../model/schema/primitives';
import type { Template } from '../../../../model/schema/template-schemas';

@singleton()
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
