import { singleton } from 'tsyringe';
import type { TokenType } from '../../../../model/schema/primitives';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Updates mapping contrast ref in the domain or UI store.
 */

@singleton()
export class SetMappingContrastRefOperation {

  /**
   * Runs the set mapping contrast ref mutation.
   * @param template Template (Template).
   * @param tokenKey Token key (string).
   * @param tokenType Token type (TokenType).
   * @param contrastVariableRef Contrast variable ref (string | null).
   * @returns Template result.
   */
  execute(
    template: Template,
    tokenKey: string,
    tokenType: TokenType,
    contrastVariableRef: string | null,
  ): Template {
    const mappings = template.mappings.map((m) => {
      if (m.token.key !== tokenKey || m.token.type !== tokenType) return m;
      if (m.ignored === true) return m;
      return m.contrastVariableRef === contrastVariableRef ? m : { ...m, contrastVariableRef };
    });
    const changed = mappings.some((mapping, index) => mapping !== template.mappings[index]);
    return changed ? { ...template, mappings } : template;
  }
}
