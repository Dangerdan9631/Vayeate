import { themeSchema } from '../model/schemas';
import { createThemeWithParams } from './theme-controller';

describe('createThemeWithParams', () => {
  it('returns an object that satisfies theme schema', () => {
    const theme = createThemeWithParams({ name: 'test' });
    const result = themeSchema.safeParse(theme);
    expect(result.success).toBe(true);
  });

  it('returns theme with the given name and defaults', () => {
    const theme = createThemeWithParams({ name: 'my-theme' });
    expect(theme.name).toBe('my-theme');
    expect(theme.version).toBe('1.0.0');
    expect(theme.templateRef).toBeNull();
    expect(theme.idePrimaryColorVariableRef).toBeNull();
    expect(theme.themeBackgroundColorVariableRef).toBeNull();
    expect(theme.colorAssignments).toEqual([]);
    expect(theme.contrastAssignments).toEqual([]);
  });
});
