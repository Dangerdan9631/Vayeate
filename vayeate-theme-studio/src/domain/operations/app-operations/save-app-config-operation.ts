import { singleton } from 'tsyringe';
import { appConfigSchema } from '../../../model/schema/primitives';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { EnqueueBackgroundActionOperation } from './enqueue-background-action-operation';
import { AppConfigStore } from '../../state/app-config/app-config-store';

@singleton()
export class SaveAppConfigOperation {
  constructor(
    private readonly appConfigStore: AppConfigStore,
    private readonly configGateway: ConfigGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundActionOperation,
  ) {}

  execute(): void {
    const appConfigState = this.appConfigStore.getStore().config;
    this.enqueueBackgroundAction.execute(async () => {
        this.configGateway.save(
          appConfigSchema.parse(appConfigState),
        );
    }, 'Saving app config');
  }
}
