import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class LoadTemplateOperation {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly templateGateway: TemplateGateway,
  ) {}

  async execute(name: string, version: string): Promise<Template | null> {
    const loaded = await this.templateGateway.loadTemplate(name, version);
    this.appStateSetter.apply({ type: 'SET_TEMPLATE', template: loaded });
    return loaded;
  }
}



