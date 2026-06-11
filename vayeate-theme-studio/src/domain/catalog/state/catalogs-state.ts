import type { Catalog } from '../../../model/schema/catalog';

/**
 * Load status and parsed catalog body for one name/version slot.
 */
export interface CatalogState {
  /**
   * Whether disk content has been loaded into this slot.
   */
  isLoaded: boolean;
  /**
   * Parsed catalog entity, or null when the ref exists but the body is not loaded.
   */
  catalog: Catalog | null;
}

/**
 * Version map keyed by semver string for one catalog name.
 */
export interface CatalogVersions {
  [version: string]: CatalogState;
}

/**
 * Catalog registry keyed by catalog name, then version.
 */
export interface CatalogMap {
  [name: string]: CatalogVersions;
}

/**
 * Root catalogs slice held in `CatalogsStore`.
 */
export interface CatalogsState {
  /**
   * All known catalog refs and loaded bodies.
   */
  catalogs: CatalogMap;
}

/**
 * Default empty catalogs slice before refs are listed from disk.
 */
export const initialCatalogsState: CatalogsState = {
  catalogs: {},
};
