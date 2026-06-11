import { singleton } from 'tsyringe';
import type { TokenType } from '../../../../model/schema/primitives';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Updates mapping color ref in the domain or UI store.
 */

@singleton()
export class SetMappingColorRefOperation {

  /**
   * Runs the set mapping color ref mutation.
   * @param template Template (Template).
   * @param tokenKey Token key (string).
   * @param tokenType Token type (TokenType).
   * @param colorVariableRef Color variable ref (string | null).
   * @returns Template result.
   */
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
