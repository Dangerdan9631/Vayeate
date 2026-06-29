import { singleton } from "tsyringe";
import { AddSemanticVariantController } from "../controllers/add-semantic-variant-controller";
import { RemoveMappingController } from "../controllers/remove-mapping-controller";
import { SetMappingColorRefController } from "../controllers/set-mapping-color-ref-controller";
import { SetMappingColorVariableFilterController } from "../controllers/set-mapping-color-variable-filter-controller";
import { SetMappingContrastRefController } from "../controllers/set-mapping-contrast-ref-controller";
import { SetMappingContrastVariableFilterController } from "../controllers/set-mapping-contrast-variable-filter-controller";
import { SetMappingGroupRefController } from "../controllers/set-mapping-group-ref-controller";
import { SetMappingSearchTextController } from "../controllers/set-mapping-search-text-controller";
import { UpdateSemanticVariantKeyController } from "../controllers/update-semantic-variant-key-controller";
import { Logger, LoggerFactory } from "../../../../domain/utils/logger";
import { MappingsCardActions, MappingsCardActionType } from "./mappings-card-action-type";
import { ApplySelectedMappingAssignmentController } from '../controllers/apply-selected-mapping-assignment-controller';
import { ClearSelectedMappingsController } from '../controllers/clear-selected-mappings-controller';
import { SetMappingGroupSelectionController } from '../controllers/set-mapping-group-selection-controller';
import { SetMappingTokenTypeSelectionController } from '../controllers/set-mapping-token-type-selection-controller';
import { ToggleSelectedMappingController } from '../controllers/toggle-selected-mapping-controller';

/**
 * Routes template mappings card actions to their controllers.
 */
@singleton()
export class MappingsCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly addSemanticVariant: AddSemanticVariantController,
    private readonly removeMapping: RemoveMappingController,
    private readonly setMappingColorRef: SetMappingColorRefController,
    private readonly setMappingColorVariableFilter: SetMappingColorVariableFilterController,
    private readonly setMappingContrastRef: SetMappingContrastRefController,
    private readonly setMappingContrastVariableFilter: SetMappingContrastVariableFilterController,
    private readonly setMappingGroupRef: SetMappingGroupRefController,
    private readonly setMappingSearchText: SetMappingSearchTextController,
    private readonly updateSemanticVariantKey: UpdateSemanticVariantKeyController,
    private readonly applySelectedMappingAssignment: ApplySelectedMappingAssignmentController,
    private readonly clearSelectedMappings: ClearSelectedMappingsController,
    private readonly setMappingGroupSelection: SetMappingGroupSelectionController,
    private readonly setMappingTokenTypeSelection: SetMappingTokenTypeSelectionController,
    private readonly toggleSelectedMapping: ToggleSelectedMappingController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(MappingsCardHandler.name);
  }

  /**
   * Dispatches a mappings card action to its controller.
   * @param action Typed card action from the action queue.
   * @returns Resolves when the controller finishes.
   */
  async handle(action: MappingsCardActions): Promise<void> {
    switch (action.type) {
      case MappingsCardActionType.MappingSearchTextOnChange:
        return this.setMappingSearchText.run(action.value);
      case MappingsCardActionType.MappingColorVariableFilterListOnSelect:
        return this.setMappingColorVariableFilter.run(action.values);
      case MappingsCardActionType.MappingContrastVariableFilterListOnSelect:
        return this.setMappingContrastVariableFilter.run(action.values);
      case MappingsCardActionType.MappingExistingTokenGroupListOnCommit:
        return this.setMappingGroupRef.run(action.tokenKey, action.tokenType, action.value || null);
      case MappingsCardActionType.MappingExistingTokenColorVariableListOnCommit:
        return this.setMappingColorRef.run(action.tokenKey, action.tokenType, action.value || null);
      case MappingsCardActionType.MappingExistingTokenContrastVariableListOnCommit:
        return this.setMappingContrastRef.run(action.tokenKey, action.tokenType, action.value);
      case MappingsCardActionType.MappingSemanticTokenAddVariantButtonOnClick:
        return this.addSemanticVariant.run(action.semanticType, action.defaultGroupRef);
      case MappingsCardActionType.MappingSemanticTokenModifierListOnCommit:
        return this.updateSemanticVariantKey.run({
          variant: 'modifier',
          tokenKey: action.tokenKey,
          modifiers: action.modifiers,
        });
      case MappingsCardActionType.MappingSemanticTokenLanguageListOnCommit:
        return this.updateSemanticVariantKey.run({
          variant: 'language',
          tokenKey: action.tokenKey,
          language: action.value,
        });
      case MappingsCardActionType.MappingSemanticTokenVariantRemoveButtonOnClick:
        return this.removeMapping.run(action.tokenKey, action.tokenType);
      case MappingsCardActionType.MappingSelectionOnToggle:
        return this.toggleSelectedMapping.run(action.mappingId);
      case MappingsCardActionType.MappingGroupSelectionOnChange:
        return this.setMappingGroupSelection.run(action.groupRef, action.checked);
      case MappingsCardActionType.MappingTokenTypeSelectionOnChange:
        return this.setMappingTokenTypeSelection.run(action.groupRef, action.tokenType, action.checked);
      case MappingsCardActionType.MappingSelectionOnClear:
        return this.clearSelectedMappings.run();
      case MappingsCardActionType.MappingSelectedAssignmentOnCommit:
        return this.applySelectedMappingAssignment.run(action.assignment);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (MappingsCardAction union not exhaustive)', { action: _exhaustive });
  }
}
