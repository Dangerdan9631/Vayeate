import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { nextPatchVersion } from '../../../utils/version';

@injectable()
export class BumpTemplateVersionForEdit {
  execute(t: Template): Template {
    if (t.locked) {
      return { ...t, version: nextPatchVersion(t.version), locked: false };
    }
    return t;
  }
}
