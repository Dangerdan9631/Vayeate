import { singleton } from 'tsyringe';
import type { TokenType } from '../../../../model/schema/primitives';
import type { Template } from '../../../../model/schema/template-schemas';
import { parseSemanticSelector } from '../../../../model/parse-semantic-selector';

/**
 * Updates mapping group ref in the domain or UI store.
 */

@singleton()
export class SetMappingGroupRefOperation {

  /**
   * Runs the set mapping group ref mutation.
   * @param template Template (Template).
   * @param tokenKey Token key (string).
   * @param tokenType Token type (TokenType).
   * @param groupRef Group ref (string | null).
   * @returns Template result.
   */
  execute(
    template: Template,
    tokenKey: string,
    tokenType: TokenType,
    groupRef: string | null,
  ): Template {
    let semanticBaseType: string | null = null;
    if (tokenType === 'semantic token') {
      try {
        const parsed = parseSemanticSelector(tokenKey);
        const isBase =
          parsed.modifiers.length === 0 && (parsed.language === null || parsed.language === '');
        if (isBase) semanticBaseType = parsed.type;
      } catch {
        /* not a valid semantic selector */
      }
    }
    const newMappings = template.mappings.map((m) => {
      if (m.token.type !== tokenType) return m;
      if (tokenType === 'semantic token' && semanticBaseType !== null) {
        try {
          const p = parseSemanticSelector(m.token.key);
          if (p.type === semanticBaseType) return { ...m, groupRef };
        } catch {
          /* ignore */
        }
        return m;
      }
      if (m.token.key === tokenKey) return { ...m, groupRef };
      return m;
    });
    return { ...template, mappings: newMappings };
  }
}
