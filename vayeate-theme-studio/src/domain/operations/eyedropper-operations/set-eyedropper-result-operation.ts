import { EyedropperUiStore } from "../../state/ui/eyedropper-ui-store";
import { HexColor } from "../../../model/schema/primitives";
import { singleton } from "tsyringe";

@singleton()
export class SetEyedropperResultOperation {
    constructor(private readonly eyedropperUiStore: EyedropperUiStore) { }

    execute(result: HexColor | null): void {
        this.eyedropperUiStore.getStore().setEyedropperResult(result);
    }
}