import { describe, expect, it } from 'vitest';
import type { Catalog, Mapping, Template, Token } from '../../model/schemas';
import { computeOrphanKeys, isMappingOrphanForTemplate } from './orphan-mappings';

describe('orphan-mappings', () => {
  it('computeOrphanKeys includes theme token missing from catalog', () => {
    const mappings: Mapping[] = [
      {
        token: { type: 'theme', key: 'only-in-mapping' },
        colorVariableRef: null,
        contrastVariableRef: null,
        groupRef: null,
      },
    ];
    const tokens: Token[] = [{ type: 'theme', key: 'in-catalog' }];
    expect(computeOrphanKeys(mappings, tokens).has('theme::only-in-mapping')).toBe(true);
  });

  it('isMappingOrphanForTemplate returns false when template has no catalog refs', () => {
    const template = { catalogRefs: [], mappings: [] } as unknown as Template;
    expect(isMappingOrphanForTemplate(template, 'k', 'theme', {})).toBe(false);
  });

  it('isMappingOrphanForTemplate matches computeOrphanKeys for loaded snapshot', () => {
    const catalog: Catalog = {
      name: 'c',
      version: '1.0.0',
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [{ type: 'theme', key: 'listed' }],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };
    const template = {
      catalogRefs: [{ name: 'c', version: '1.0.0' }],
      mappings: [
        {
          token: { type: 'theme', key: 'ghost' },
          colorVariableRef: 'fg',
          contrastVariableRef: null,
          groupRef: null,
        },
      ],
    } as unknown as Template;
    const loaded = { 'c@1.0.0': catalog };
    expect(isMappingOrphanForTemplate(template, 'ghost', 'theme', loaded)).toBe(true);
    expect(isMappingOrphanForTemplate(template, 'listed', 'theme', loaded)).toBe(false);
  });
});
