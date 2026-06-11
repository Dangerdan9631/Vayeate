import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { nextPatchVersion } from '../../../utils/next-patch-version';

/**
 * Increments template version for edit for edit tracking.
 */

@singleton()
export class BumpTemplateVersionForEditOperation {

  /**
   * Runs the bump template version for edit mutation.
   * @param t T (Template).
   * @returns Template result.
   */
  execute(t: Template): Template {
    if (t.locked) {
      return { ...t, version: nextPatchVersion(t.version), locked: false };
    }
    return t;
  }
}
