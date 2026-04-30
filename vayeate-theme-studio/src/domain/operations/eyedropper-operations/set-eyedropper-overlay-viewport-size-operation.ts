import { singleton } from "tsyringe";
import { EyedropperUiStore } from "../../state/ui/eyedropper-ui-store";
import { Size } from "../../../model/geometry";

@singleton()
export class SetEyedropperOverlayViewportSizeOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  execute(size: Size): void {
    this.eyedropperUiStore.getStore().setEyedropperOverlayViewportSize(size);
  }
}