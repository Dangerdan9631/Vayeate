import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';

/**
 * If `head` exists and is not locked, return a locked copy to persist; otherwise null.
 */
@singleton()
export class LockHeadCatalogIfUnlockedOperation {

  /**
   * Runs the lock head catalog if unlocked mutation.
   * @param head Head (Catalog | null).
   * @returns Catalog | null result.
   */
  execute(head: Catalog | null): Catalog | null {
    if (!head || head.locked) return null;
    return { ...head, locked: true };
  }
}
