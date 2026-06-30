import { singleton } from 'tsyringe';
import type { TokenType } from '../../../../model/schema/primitives';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Updates a mapping style variable reference.
 */
@singleton()
export class SetMappingStyleRefOperation {
  /**
   * Runs the set mapping style ref mutation.
   * @param template Template.
   * @param tokenKey Mapping token key.
   * @param tokenType Mapping token type.
   * @param styleVariableRef Style variable ref.
   * @returns Template result.
   */
  execute(
    template: Template,
    tokenKey: string,
    tokenType: TokenType,
    styleVariableRef: string | null,
  ): Template {
    const mappings = template.mappings.map((m) => {
      if (m.token.key !== tokenKey || m.token.type !== tokenType) return m;
      if (m.ignored === true) return m;
      return m.styleVariableRef === styleVariableRef ? m : { ...m, styleVariableRef };
    });
    const changed = mappings.some((mapping, index) => mapping !== template.mappings[index]);
    return changed ? { ...template, mappings } : template;
  }
}
