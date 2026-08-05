import { singleton } from 'tsyringe';
import type { ContrastVariable, Mapping } from '../../../../model/Template/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment } from '../../../../model/Theme/schema/theme-schemas';
import {
  selectScopeColorMapInputs,
  type ScopeColorMap,
} from '../../../../domain/operations/Theme/theme-operations/theme-utils/scope-resolver-operation';
import { ScopeResolverService } from '../../../services/Common/scope-resolver-service';

/**
 * Inputs required to build a scope color map off the main thread.
 */
export interface ScopeResolverInputs {
  mappings: readonly Mapping[];
  colorAssignments: readonly ColorAssignment[];
  contrastAssignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
}

/**
 * Facade for editor preview scope-map resolution.
 */
@singleton()
export class ScopeResolverGateway {
  constructor(private readonly scopeResolverService: ScopeResolverService) {}

  /**
   * Builds a normalized scope color map using the worker-backed service.
   *
   * @param inputs - Mappings, color assignments, and contrast data for resolution.
   * @returns Resolved scope color map, or null when a newer worker request superseded this one.
   */
  buildScopeColorMap(inputs: ScopeResolverInputs): Promise<ScopeColorMap | null> {
    return this.scopeResolverService.buildScopeColorMap(
      selectScopeColorMapInputs(
        inputs.mappings,
        inputs.colorAssignments,
        inputs.contrastAssignments,
        inputs.contrastVariables,
      ),
    );
  }
}
