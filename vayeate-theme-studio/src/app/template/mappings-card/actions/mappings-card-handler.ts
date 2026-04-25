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
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(MappingsCardHandler.name);
  }

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
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (MappingsCardAction union not exhaustive)', { action: _exhaustive });
  }
}
