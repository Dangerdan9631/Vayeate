import { singleton } from 'tsyringe';
import { LoadTemplateRefsOperation } from '../../../operations/template-operations';

@singleton()
export class LoadTemplateRefsController {
  constructor(private readonly loadTemplateRefs: LoadTemplateRefsOperation) {}

  async run(): Promise<void> {
    await this.loadTemplateRefs.execute();
  }
}

