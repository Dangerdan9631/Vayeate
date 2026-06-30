import { singleton } from 'tsyringe';
import type { TokenType } from '../../../../model/schema/primitives';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Removes mapping from template from the parent entity in the store.
 */

@singleton()
export class RemoveMappingFromTemplateOperation {

  /**
   * Runs the remove mapping from template mutation.
   * @param template Template (Template).
   * @param tokenKey Token key (string).
   * @param tokenType Token type (TokenType).
   * @returns Template result.
   */
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
