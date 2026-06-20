import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { Template } from '../../../../model/schema/template-schemas';
import type {
  TemplateMappingAssignment,
  TemplateMappingId,
} from '../../../../model/template-mapping-assignment';
import { templateMappingIdKey } from '../../../../model/template-mapping-assignment';
import { isMappingOrphanForTemplate } from '../../../utils/is-mapping-orphan-for-template';

export interface ApplyMappingAssignmentInput {
  template: Template;
  mappingIds: readonly TemplateMappingId[];
  assignment: TemplateMappingAssignment;
  catalogs: readonly Catalog[];
}

/** Applies one validated assignment to a set of persisted template mappings. */
@singleton()
export class ApplyMappingAssignmentOperation {
  execute(input: ApplyMappingAssignmentInput): Template {
    const selectedKeys = new Set(input.mappingIds.map(templateMappingIdKey));
    if (selectedKeys.size === 0) return input.template;
    const hasTarget = input.template.mappings.some((mapping) => selectedKeys.has(templateMappingIdKey({
      tokenKey: mapping.token.key,
      tokenType: mapping.token.type,
    })));
    if (!hasTarget) return input.template;
    this.validateAssignment(input.template, input.assignment);

    const mappings = input.template.mappings.flatMap((mapping) => {
      const id = { tokenKey: mapping.token.key, tokenType: mapping.token.type };
      if (!selectedKeys.has(templateMappingIdKey(id))) return [mapping];

      if (
        input.assignment.kind === 'color'
        && input.assignment.value === null
        && isMappingOrphanForTemplate(
          input.template,
          mapping.token.key,
          mapping.token.type,
          [...input.catalogs],
        )
      ) {
        return [];
      }

      switch (input.assignment.kind) {
        case 'group':
          return mapping.groupRef === input.assignment.value
            ? [mapping]
            : [{ ...mapping, groupRef: input.assignment.value }];
        case 'color':
          return mapping.colorVariableRef === input.assignment.value
            ? [mapping]
            : [{ ...mapping, colorVariableRef: input.assignment.value }];
        case 'contrast':
          return mapping.contrastVariableRef === input.assignment.value
            ? [mapping]
            : [{ ...mapping, contrastVariableRef: input.assignment.value }];
      }
    });

    const changed = mappings.length !== input.template.mappings.length
      || mappings.some((mapping, index) => mapping !== input.template.mappings[index]);
    return changed ? { ...input.template, mappings } : input.template;
  }

  private validateAssignment(
    template: Template,
    assignment: TemplateMappingAssignment,
  ): void {
    if (assignment.value === null) return;
    const exists = assignment.kind === 'group'
      ? template.groups.includes(assignment.value)
      : assignment.kind === 'color'
        ? template.colorVariables.some((variable) => variable.key === assignment.value)
        : template.contrastVariables.some((variable) => variable.key === assignment.value);
    if (!exists) throw new Error(`Unknown template mapping ${assignment.kind} assignment`);
  }
}
