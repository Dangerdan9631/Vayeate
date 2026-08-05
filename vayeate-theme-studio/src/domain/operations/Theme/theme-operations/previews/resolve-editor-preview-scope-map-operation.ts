import { singleton } from 'tsyringe';
import { ScopeResolverGateway } from '../../../../../gateway/gateway/Common/scope-resolver/scope-resolver-gateway';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../../model/Queue/background-queue';
import type { ContrastVariable, Mapping } from '../../../../../model/Template/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment } from '../../../../../model/Theme/schema/theme-schemas';
import { ThemePreviewStore } from '../../../../state/Theme/ui/theme-preview-store';
import { ThemeUiStore } from '../../../../state/Theme/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../../Queue/background-queue/enqueue-background-queue-action-operation';

/**
 * Inputs for resolving editor preview scope colors.
 */
export interface ResolveEditorPreviewScopeMapInput {
  mappings: readonly Mapping[];
  colorAssignments: readonly ColorAssignment[];
  contrastAssignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
  scopeThemeInputsGeneration: number;
  scopeTemplateInputsGeneration: number;
}

/**
 * Resolves editor preview scope color maps and commits fresh results to preview state.
 */
@singleton()
export class ResolveEditorPreviewScopeMapOperation {
  constructor(
    private readonly themePreviewStore: ThemePreviewStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly scopeResolverGateway: ScopeResolverGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs scope-map resolution on the deferred background queue.
   * @param input Snapshot of current scope-map inputs and generations.
   * @returns Background-queue continuation for chained async work.
   */
  execute(input: ResolveEditorPreviewScopeMapInput): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'deferred',
      'Resolving editor preview scopes',
      async () => {
        const scopeColorMap = await this.scopeResolverGateway.buildScopeColorMap({
          mappings: input.mappings,
          colorAssignments: input.colorAssignments,
          contrastAssignments: input.contrastAssignments,
          contrastVariables: input.contrastVariables,
        });
        if (scopeColorMap === null) return;

        const currentThemeGeneration = this.themeUiStore.getStore().state.scopeThemeInputsGeneration;
        const currentTemplateGeneration = this.themePreviewStore.getStore().state.scopeTemplateInputsGeneration;
        if (
          currentThemeGeneration !== input.scopeThemeInputsGeneration ||
          currentTemplateGeneration !== input.scopeTemplateInputsGeneration
        ) {
          return;
        }

        this.themePreviewStore.getStore().setScopeColorMap(scopeColorMap);
      },
    );
  }
}
