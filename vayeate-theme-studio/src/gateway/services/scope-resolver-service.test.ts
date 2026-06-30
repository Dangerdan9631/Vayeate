// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { ScopeResolverService } from './scope-resolver-service';

describe('ScopeResolverService', () => {
  const sampleInputs = {
    mappings: [
      {
        token: { key: 'keyword', type: 'textmate token' as const },
        colorVariableRef: 'fg',
        contrastVariableRef: null,
        groupRef: null,
      },
    ],
    colorAssignments: [
      {
        colorRef: 'fg',
        dark: { value: '#111111' },
        light: { value: '#eeeeee' },
        useDarkForLight: false,
      },
    ],
    contrastAssignments: [],
    contrastVariables: [],
  };

  it('builds a scope color map synchronously when Worker is unavailable', async () => {
    const service = new ScopeResolverService();
    const result = await service.buildScopeColorMap(sampleInputs);

    expect(result).not.toBeNull();
    expect(result!.entries).toHaveLength(1);
    expect(result!.entries[0]?.darkColor).toBe('#111111');
    expect(result!.entries[0]?.lightColor).toBe('#eeeeee');
  });

  it('returns null for superseded requests when a newer call is made', async () => {
    const service = new ScopeResolverService();
    const slow = service.buildScopeColorMap({
      mappings: [
        ...sampleInputs.mappings,
        {
          token: { key: 'comment', type: 'textmate token' as const },
          colorVariableRef: 'fg',
          contrastVariableRef: null,
          groupRef: null,
        },
      ],
      colorAssignments: sampleInputs.colorAssignments,
      contrastAssignments: sampleInputs.contrastAssignments,
      contrastVariables: sampleInputs.contrastVariables,
    });
    const fast = service.buildScopeColorMap(sampleInputs);

    const [slowResult, fastResult] = await Promise.all([slow, fast]);
    expect(fastResult).not.toBeNull();
    expect(fastResult!.entries).toHaveLength(1);
    expect(slowResult).toBeNull();
  });
});
