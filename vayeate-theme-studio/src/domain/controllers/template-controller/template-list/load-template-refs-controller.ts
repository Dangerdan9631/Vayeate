import { singleton } from 'tsyringe';
import { LoadTemplateRefsOperation } from '../../../operations/template-operations/template-list/load-template-refs-operation';

@singleton()
export class LoadTemplateRefsController {
  constructor(private readonly loadTemplateRefs: LoadTemplateRefsOperation) {}

  async run(): Promise<void> {
    await this.loadTemplateRefs.execute();
  }
}

