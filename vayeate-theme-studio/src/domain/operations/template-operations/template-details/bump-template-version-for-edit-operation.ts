import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { nextPatchVersion } from '../../../utils/next-patch-version';

@singleton()
export class BumpTemplateVersionForEditOperation {
  execute(t: Template): Template {
    if (t.locked) {
      return { ...t, version: nextPatchVersion(t.version), locked: false };
    }
    return t;
  }
}
