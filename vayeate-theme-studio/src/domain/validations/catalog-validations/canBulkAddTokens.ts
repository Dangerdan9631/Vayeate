import type { Catalog } from '../../../model/schemas';

export function canBulkAddTokens(
  catalog: Catalog | null | undefined,
  text: string | undefined,
): catalog is Catalog {
  return !!catalog && !!text?.trim();
}
