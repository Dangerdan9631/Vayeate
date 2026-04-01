import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';

/** If `head` exists and is not locked, return a locked copy to persist; otherwise null. */
@injectable()
export class LockHeadCatalogIfUnlockedOperation {
  execute(head: Catalog | null): Catalog | null {
    if (!head || head.locked) return null;
    return { ...head, locked: true };
  }
}
