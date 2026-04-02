import type { TemplateReference } from '../../../../model/schemas';
import { injectable } from 'tsyringe';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

@injectable()
export class SetTemplateRefsOperation {
  constructor(private readonly templatesStateSetter: TemplatesStateSetter) {}

  execute(refs: TemplateReference[]): void {
    this.templatesStateSetter.apply({
      type: 'SET_TEMPLATE_MAP_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
    });
  }
}
