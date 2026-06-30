import { singleton } from 'tsyringe';
import type { TokenType } from '../../../../model/schema/primitives';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Updates whether one template mapping should be ignored.
 */
@singleton()
export class SetMappingIgnoredOperation {
  /**
   * Runs the ignored flag mutation.
   * @param template Template.
   * @param tokenKey Mapping token key.
   * @param tokenType Mapping token type.
   * @param ignored Whether the mapping is intentionally ignored.
   * @returns Template result.
   */
  execute(
    template: Template,
    tokenKey: string,
    tokenType: TokenType,
    ignored: boolean,
  ): Template {
    const mappings = template.mappings.map((m) => {
      if (m.token.key !== tokenKey || m.token.type !== tokenType) return m;
      if ((m.ignored ?? false) === ignored) return m;
      return {
        ...m,
        ignored,
        colorVariableRef: ignored ? null : m.colorVariableRef,
        contrastVariableRef: ignored ? null : m.contrastVariableRef,
        styleVariableRef: ignored ? null : m.styleVariableRef,
      };
    });
    const changed = mappings.some((mapping, index) => mapping !== template.mappings[index]);
    return changed ? { ...template, mappings } : template;
  }
}
