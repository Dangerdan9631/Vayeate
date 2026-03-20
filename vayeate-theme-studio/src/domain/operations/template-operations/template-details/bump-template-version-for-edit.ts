import type { Template } from '../../../../model/schemas';
import { nextPatchVersion } from '../../../utils/version';

export function bumpTemplateVersionForEdit(t: Template): Template {
  if (t.locked) {
    return { ...t, version: nextPatchVersion(t.version), locked: false };
  }
  return t;
}
