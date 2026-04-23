import { singleton } from "tsyringe";
import { AddVariableController } from "../controllers/add-variable-controller";
import { RemoveVariableController } from "../controllers/remove-variable-controller";
import { SetTemplateAddVariableNameController } from "../controllers/set-template-add-variable-name-controller";
import { SetVariablesSearchTextController } from "../controllers/set-variables-search-text-controller";
import { UpdateContrastComparisonSourceController } from "../controllers/update-contrast-comparison-source-controller";
import { UpdateVariableGroupRefController } from "../controllers/update-variable-group-ref-controller";
import { Logger, LoggerFactory } from "../../../../../domain/utils/logger";
import { VariablesCardActions, VariablesCardActionType } from "./variables-card-action-type";

@singleton()
export class VariablesCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly addVariable: AddVariableController,
    private readonly removeVariable: RemoveVariableController,
    private readonly setTemplateAddVariableName: SetTemplateAddVariableNameController,
    private readonly setVariablesSearchText: SetVariablesSearchTextController,
    private readonly updateContrastComparisonSource: UpdateContrastComparisonSourceController,
    private readonly updateVariableGroupRef: UpdateVariableGroupRefController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(VariablesCardHandler.name);
  }

  async handle(action: VariablesCardActions): Promise<void> {
    switch (action.type) {
      case VariablesCardActionType.VariablesSearchTextOnChange:
        return this.setVariablesSearchText.run(action.value);
      case VariablesCardActionType.VariablesAddVariableNameTextOnChange:
        return this.setTemplateAddVariableName.run(action.value);
      case VariablesCardActionType.VariablesAddVariableButtonOnClick:
        return this.addVariable.run(action.groupRef, action.variableKind);
      case VariablesCardActionType.VariablesGroupListOnCommit:
        return this.updateVariableGroupRef.run(action.variableKey, action.value || null);
      case VariablesCardActionType.VariablesRemoveButtonOnClick:
        return this.removeVariable.run(action.key);
      case VariablesCardActionType.VariablesContrastSourceListOnCommit:
        return this.updateContrastComparisonSource.run(action.contrastVariableKey, action.value);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (VariablesCardAction union not exhaustive)', { action: _exhaustive });
  }
}
