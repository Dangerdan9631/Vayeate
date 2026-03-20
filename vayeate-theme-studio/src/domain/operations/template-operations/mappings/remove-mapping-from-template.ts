import type { Template, TokenType } from '../../../../model/schemas';

export function removeMappingFromTemplate(
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
