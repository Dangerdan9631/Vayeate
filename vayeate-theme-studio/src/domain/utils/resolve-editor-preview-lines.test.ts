import { describe, expect, it } from 'vitest';
import { buildPreviewTokenTooltipTitle } from './resolve-editor-preview-lines';

describe('editor preview contrast tooltip', () => {
  it('reports min and max contrast bounds against the comparison source', () => {
    const title = buildPreviewTokenTooltipTitle(
      'dark',
      {
        scopeLabel: 'keyword.control',
        entry: {
          segments: ['keyword', 'control'],
          darkColor: '#777777',
          lightColor: null,
          colorVariableRef: 'accent',
          contrastVariableRef: 'contrast',
          assignedDark: '#000000',
          assignedLight: null,
        },
      },
      {
        colorAssignments: [
          {
            colorRef: 'source',
            dark: { value: '#ffffff' },
            light: null,
            useDarkForLight: true,
          },
        ],
        contrastAssignments: [
          {
            contrastVariableRef: 'contrast',
            dark: {
              value: 1,
              comparisonMethod: 'greaterThan',
              min: null,
              max: 3,
            },
            light: null,
            useDarkForLight: true,
          },
        ],
        contrastVariables: [
          {
            key: 'contrast',
            comparisonSourceRef: 'source',
            groupRef: null,
          },
        ],
      },
    );

    expect(title).toContain('Comparison source: source (#ffffff)');
    expect(title).toContain('vs source');
    expect(title).not.toContain('vs black');
  });
});
