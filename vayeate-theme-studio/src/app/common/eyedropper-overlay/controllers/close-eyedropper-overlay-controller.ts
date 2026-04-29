import { singleton } from 'tsyringe';
import type { HexColor } from '../../../../model/schema/primitives';
import { CloseEyedropperOperation } from '../../../../domain/operations/eyedropper-operations/close-eyedropper-operation';
import { SetEyedropperResultOperation } from '../../../../domain/operations/eyedropper-operations/set-eyedropper-result-operation';
import { EnqueueActionQueueOperation } from '../../../../domain/operations/action-queue/enqueue-action-queue-operation';
import { EyedropperUiStore } from '../../../../domain/state/ui/eyedropper-ui-store';

@singleton()
export class CloseEyedropperOverlayController {
  constructor(
    private readonly closeEyedropper: CloseEyedropperOperation,
    private readonly setEyedropperResult: SetEyedropperResultOperation,
    private readonly enqueueCallbackAction: EnqueueActionQueueOperation,
    private readonly eyedropperUiStore: EyedropperUiStore,
  ) {}

  run(result: HexColor | null): void {
    this.setEyedropperResult.execute(result);

    const callbackAction = this.eyedropperUiStore.getStore().state.callbackAction;
    if (callbackAction && result) {
      this.enqueueCallbackAction.execute(callbackAction);
    } 
    
    this.closeEyedropper.execute();
  }
}
