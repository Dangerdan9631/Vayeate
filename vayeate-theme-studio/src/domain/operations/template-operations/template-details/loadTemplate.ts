import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { templateService } from '../../../../gateway/services/template-service';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class LoadTemplate {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  async execute(name: string, version: string): Promise<Template | null> {
    const loaded = await templateService.loadTemplate(name, version);
    this.appStateSetter.apply({ type: 'SET_TEMPLATE', template: loaded });
    return loaded;
  }
}



