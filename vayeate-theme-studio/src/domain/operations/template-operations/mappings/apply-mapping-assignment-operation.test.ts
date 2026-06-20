import { describe, expect, it } from 'vitest';
import { templateSchema, type Template } from '../../../../model/schema/template-schemas';
import { ApplyMappingAssignmentOperation } from './apply-mapping-assignment-operation';

function createTemplate(): Template {
  return templateSchema.parse({
    name: 'test-template',
    version: '1.0.0',
    locked: false,
    catalogRefs: [],
    groups: ['base', 'accent'],
    colorVariables: [{ key: 'foreground' }, { key: 'accentColor' }],
    contrastVariables: [
      { key: 'mainContrast', comparisonSourceRef: 'foreground' },
      { key: 'accentContrast', comparisonSourceRef: 'accentColor' },
    ],
    mappings: [
      {
        token: { key: 'editor.foreground', type: 'theme' },
        groupRef: 'base',
        colorVariableRef: 'foreground',
        contrastVariableRef: 'mainContrast',
      },
      {
        token: { key: 'keyword', type: 'textmate token' },
        groupRef: null,
        colorVariableRef: null,
        contrastVariableRef: null,
      },
      {
        token: { key: 'variable.readonly', type: 'semantic token' },
        groupRef: null,
        colorVariableRef: null,
        contrastVariableRef: null,
      },
    ],
  });
}

describe('ApplyMappingAssignmentOperation', () => {
  const operation = new ApplyMappingAssignmentOperation();
  const selected = [
    { tokenKey: 'editor.foreground', tokenType: 'theme' as const },
    { tokenKey: 'variable.readonly', tokenType: 'semantic token' as const },
  ];

  it.each([
    { assignment: { kind: 'group' as const, value: 'accent' }, field: 'groupRef' as const, expected: 'accent' },
    { assignment: { kind: 'color' as const, value: 'accentColor' }, field: 'colorVariableRef' as const, expected: 'accentColor' },
    { assignment: { kind: 'contrast' as const, value: 'accentContrast' }, field: 'contrastVariableRef' as const, expected: 'accentContrast' },
  ])('applies a $assignment.kind assignment to selected mappings only', ({ assignment, field, expected }) => {
    const template = createTemplate();
    const next = operation.execute({ template, mappingIds: selected, assignment, catalogs: [] });

    expect(next).not.toBe(template);
    expect(next.mappings[0]?.[field]).toBe(expected);
    expect(next.mappings[1]).toBe(template.mappings[1]);
    expect(next.mappings[2]?.[field]).toBe(expected);
  });

  it('clears the selected assignment without changing unselected mappings', () => {
    const template = createTemplate();
    const next = operation.execute({
      template,
      mappingIds: [selected[0]],
      assignment: { kind: 'color', value: null },
      catalogs: [],
    });

    expect(next.mappings[0]?.colorVariableRef).toBeNull();
    expect(next.mappings[1]).toBe(template.mappings[1]);
    expect(next.mappings[2]).toBe(template.mappings[2]);
  });

  it('returns the same template for stale targets and no-op assignments', () => {
    const template = createTemplate();
    expect(operation.execute({
      template,
      mappingIds: [{ tokenKey: 'missing', tokenType: 'theme' }],
      assignment: { kind: 'group', value: 'missing-group' },
      catalogs: [],
    })).toBe(template);
    expect(operation.execute({
      template,
      mappingIds: [selected[0]],
      assignment: { kind: 'group', value: 'base' },
      catalogs: [],
    })).toBe(template);
  });

  it('rejects an invalid reference before constructing a next template', () => {
    const template = createTemplate();
    expect(() => operation.execute({
      template,
      mappingIds: selected,
      assignment: { kind: 'color', value: 'missingColor' },
      catalogs: [],
    })).toThrow('Unknown template mapping color assignment');
    expect(template.mappings[0]?.colorVariableRef).toBe('foreground');
  });
});
