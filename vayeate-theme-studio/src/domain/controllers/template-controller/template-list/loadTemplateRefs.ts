import { singleton } from 'tsyringe';
import { LoadTemplateRefs } from '../../../operations/template-operations';

@singleton()
export class LoadTemplateRefsController {
  constructor(private readonly loadTemplateRefs: LoadTemplateRefs) {}

  async run(): Promise<void> {
    await this.loadTemplateRefs.execute();
  }
}

