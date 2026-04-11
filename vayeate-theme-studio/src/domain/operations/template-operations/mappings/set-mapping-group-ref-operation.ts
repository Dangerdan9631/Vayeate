import { singleton } from 'tsyringe';
import type { Template, TokenType } from '../../../../model/schemas';
import { parseSemanticSelector } from '../../../utils/semantic-token';

@singleton()
export class SetMappingGroupRefOperation {
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
