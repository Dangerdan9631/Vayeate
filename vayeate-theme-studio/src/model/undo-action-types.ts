/**
 * Undo diff action type for a catalog token key change.
 */
export const CATALOG_TOKEN_KEY_UPDATED = 'CATALOG_TOKEN_KEY_UPDATED' as const;
/**
 * Undo diff action type for bulk-added catalog tokens.
 */
export const CATALOG_TOKENS_BULK_ADDED = 'CATALOG_TOKENS_BULK_ADDED' as const;
/**
 * Undo diff action type for adding a catalog source.
 */
export const CATALOG_SOURCE_ADDED = 'CATALOG_SOURCE_ADDED' as const;
/**
 * Undo diff action type for removing a catalog source.
 */
export const CATALOG_SOURCE_REMOVED = 'CATALOG_SOURCE_REMOVED' as const;
/**
 * Undo diff action type for updating a catalog source URL.
 */
export const CATALOG_SOURCE_URL_UPDATED = 'CATALOG_SOURCE_URL_UPDATED' as const;
/**
 * Undo diff action type for updating a catalog source type.
 */
export const CATALOG_SOURCE_TYPE_UPDATED = 'CATALOG_SOURCE_TYPE_UPDATED' as const;
/**
 * Undo diff action type for updating a catalog source token type.
 */
export const CATALOG_SOURCE_TOKEN_TYPE_UPDATED = 'CATALOG_SOURCE_TOKEN_TYPE_UPDATED' as const;
/**
 * Undo diff action type for locking a catalog.
 */
export const CATALOG_LOCKED = 'CATALOG_LOCKED' as const;
/**
 * Undo diff action type for syncing a catalog.
 */
export const CATALOG_SYNCED = 'CATALOG_SYNCED' as const;
/**
 * Undo diff action type for adding a catalog token.
 */
export const CATALOG_TOKEN_ADDED = 'CATALOG_TOKEN_ADDED' as const;
/**
 * Undo diff action type for removing a catalog token.
 */
export const CATALOG_TOKEN_REMOVED = 'CATALOG_TOKEN_REMOVED' as const;
/**
 * Undo diff action type for adding a semantic selector to the catalog.
 */
export const CATALOG_SEMANTIC_SELECTOR_ADDED = 'CATALOG_SEMANTIC_SELECTOR_ADDED' as const;
/**
 * Undo diff action type for removing a semantic registry item.
 */
export const CATALOG_SEMANTIC_REGISTRY_ITEM_REMOVED = 'CATALOG_SEMANTIC_REGISTRY_ITEM_REMOVED' as const;
/**
 * Undo diff action type for updating semantic registry text.
 */
export const CATALOG_SEMANTIC_REGISTRY_TEXT_UPDATED = 'CATALOG_SEMANTIC_REGISTRY_TEXT_UPDATED' as const;
/**
 * Undo diff action type for reverting a catalog to a prior version.
 */
export const CATALOG_REVERTED_TO_VERSION = 'CATALOG_REVERTED_TO_VERSION' as const;
/**
 * Undo diff action type for deleting a catalog version.
 */
export const CATALOG_VERSION_DELETED = 'CATALOG_VERSION_DELETED' as const;
/**
 * Undo diff action type for creating a new catalog.
 */
export const CATALOG_CREATED = 'CATALOG_CREATED' as const;

/**
 * All catalog undo diff action types registered on the universal undo processor.
 */
export const CATALOG_UNDO_ACTION_TYPES = [
  CATALOG_TOKEN_KEY_UPDATED,
  CATALOG_TOKENS_BULK_ADDED,
  CATALOG_SOURCE_ADDED,
  CATALOG_SOURCE_REMOVED,
  CATALOG_SOURCE_URL_UPDATED,
  CATALOG_SOURCE_TYPE_UPDATED,
  CATALOG_SOURCE_TOKEN_TYPE_UPDATED,
  CATALOG_LOCKED,
  CATALOG_SYNCED,
  CATALOG_TOKEN_ADDED,
  CATALOG_TOKEN_REMOVED,
  CATALOG_SEMANTIC_SELECTOR_ADDED,
  CATALOG_SEMANTIC_REGISTRY_ITEM_REMOVED,
  CATALOG_SEMANTIC_REGISTRY_TEXT_UPDATED,
  CATALOG_REVERTED_TO_VERSION,
  CATALOG_VERSION_DELETED,
  CATALOG_CREATED,
] as const;

/**
 * Union of every catalog undo diff action type string.
 */
export type CatalogUndoActionType = (typeof CATALOG_UNDO_ACTION_TYPES)[number];

/**
 * Undo diff action type for adding a template color variable.
 */
export const TEMPLATE_COLOR_VARIABLE_ADDED = 'TEMPLATE_COLOR_VARIABLE_ADDED' as const;
/**
 * Undo diff action type for adding a template contrast variable.
 */
export const TEMPLATE_CONTRAST_VARIABLE_ADDED = 'TEMPLATE_CONTRAST_VARIABLE_ADDED' as const;
/**
 * Undo diff action type for adding a template style variable.
 */
export const TEMPLATE_STYLE_VARIABLE_ADDED = 'TEMPLATE_STYLE_VARIABLE_ADDED' as const;
/**
 * Undo diff action type for adding a template variable group.
 */
export const TEMPLATE_GROUP_ADDED = 'TEMPLATE_GROUP_ADDED' as const;
/**
 * Undo diff action type for removing a template color variable.
 */
export const TEMPLATE_COLOR_VARIABLE_REMOVED = 'TEMPLATE_COLOR_VARIABLE_REMOVED' as const;
/**
 * Undo diff action type for removing a template contrast variable.
 */
export const TEMPLATE_CONTRAST_VARIABLE_REMOVED = 'TEMPLATE_CONTRAST_VARIABLE_REMOVED' as const;
/**
 * Undo diff action type for removing a template style variable.
 */
export const TEMPLATE_STYLE_VARIABLE_REMOVED = 'TEMPLATE_STYLE_VARIABLE_REMOVED' as const;
/**
 * Undo diff action type for updating a template variable group reference.
 */
export const TEMPLATE_VARIABLE_GROUP_REF_UPDATED = 'TEMPLATE_VARIABLE_GROUP_REF_UPDATED' as const;
/**
 * Undo diff action type for updating a template contrast comparison source.
 */
export const TEMPLATE_CONTRAST_COMPARISON_SOURCE_UPDATED = 'TEMPLATE_CONTRAST_COMPARISON_SOURCE_UPDATED' as const;
/**
 * Undo diff action type for removing a template group.
 */
export const TEMPLATE_GROUP_REMOVED = 'TEMPLATE_GROUP_REMOVED' as const;
/**
 * Undo diff action type for adding a template semantic variant.
 */
export const TEMPLATE_SEMANTIC_VARIANT_ADDED = 'TEMPLATE_SEMANTIC_VARIANT_ADDED' as const;
/**
 * Undo diff action type for removing a template mapping.
 */
export const TEMPLATE_MAPPING_REMOVED = 'TEMPLATE_MAPPING_REMOVED' as const;
/**
 * Undo diff action type for updating a template semantic variant key.
 */
export const TEMPLATE_SEMANTIC_VARIANT_KEY_UPDATED = 'TEMPLATE_SEMANTIC_VARIANT_KEY_UPDATED' as const;
/**
 * Undo diff action type for setting a template mapping color reference.
 */
export const TEMPLATE_MAPPING_COLOR_REF_SET = 'TEMPLATE_MAPPING_COLOR_REF_SET' as const;
/**
 * Undo diff action type for setting a template mapping contrast reference.
 */
export const TEMPLATE_MAPPING_CONTRAST_REF_SET = 'TEMPLATE_MAPPING_CONTRAST_REF_SET' as const;
/**
 * Undo diff action type for setting a template mapping style reference.
 */
export const TEMPLATE_MAPPING_STYLE_REF_SET = 'TEMPLATE_MAPPING_STYLE_REF_SET' as const;
/**
 * Undo diff action type for setting a template mapping group reference.
 */
export const TEMPLATE_MAPPING_GROUP_REF_SET = 'TEMPLATE_MAPPING_GROUP_REF_SET' as const;
/**
 * Undo diff action type for setting whether a template mapping is ignored.
 */
export const TEMPLATE_MAPPING_IGNORED_SET = 'TEMPLATE_MAPPING_IGNORED_SET' as const;
/**
 * Undo diff action type for toggling a template catalog attachment.
 */
export const TEMPLATE_CATALOG_TOGGLED = 'TEMPLATE_CATALOG_TOGGLED' as const;
/**
 * Undo diff action type for changing a template catalog version.
 */
export const TEMPLATE_CATALOG_VERSION_CHANGED = 'TEMPLATE_CATALOG_VERSION_CHANGED' as const;
/**
 * Undo diff action type for locking a template.
 */
export const TEMPLATE_LOCKED = 'TEMPLATE_LOCKED' as const;
/**
 * Undo diff action type for updating all template catalog attachments.
 */
export const TEMPLATE_CATALOGS_ALL_UPDATED = 'TEMPLATE_CATALOGS_ALL_UPDATED' as const;
/**
 * Undo diff action type for creating a new template.
 */
export const TEMPLATE_CREATED = 'TEMPLATE_CREATED' as const;
/**
 * Undo diff action type for deleting a template version.
 */
export const TEMPLATE_VERSION_DELETED = 'TEMPLATE_VERSION_DELETED' as const;

/**
 * All template undo diff action types registered on the universal undo processor.
 */
export const TEMPLATE_UNDO_ACTION_TYPES = [
  TEMPLATE_COLOR_VARIABLE_ADDED,
  TEMPLATE_CONTRAST_VARIABLE_ADDED,
  TEMPLATE_STYLE_VARIABLE_ADDED,
  TEMPLATE_GROUP_ADDED,
  TEMPLATE_COLOR_VARIABLE_REMOVED,
  TEMPLATE_CONTRAST_VARIABLE_REMOVED,
  TEMPLATE_STYLE_VARIABLE_REMOVED,
  TEMPLATE_VARIABLE_GROUP_REF_UPDATED,
  TEMPLATE_CONTRAST_COMPARISON_SOURCE_UPDATED,
  TEMPLATE_GROUP_REMOVED,
  TEMPLATE_SEMANTIC_VARIANT_ADDED,
  TEMPLATE_MAPPING_REMOVED,
  TEMPLATE_SEMANTIC_VARIANT_KEY_UPDATED,
  TEMPLATE_MAPPING_COLOR_REF_SET,
  TEMPLATE_MAPPING_CONTRAST_REF_SET,
  TEMPLATE_MAPPING_STYLE_REF_SET,
  TEMPLATE_MAPPING_GROUP_REF_SET,
  TEMPLATE_MAPPING_IGNORED_SET,
  TEMPLATE_CATALOG_TOGGLED,
  TEMPLATE_CATALOG_VERSION_CHANGED,
  TEMPLATE_LOCKED,
  TEMPLATE_CATALOGS_ALL_UPDATED,
  TEMPLATE_CREATED,
  TEMPLATE_VERSION_DELETED,
] as const;

/**
 * Union of every template undo diff action type string.
 */
export type TemplateUndoActionType = (typeof TEMPLATE_UNDO_ACTION_TYPES)[number];

/**
 * Undo diff action type for assigning a theme palette color.
 */
export const THEME_PALETTE_COLOR_ASSIGNED = 'THEME_PALETTE_COLOR_ASSIGNED' as const;
/**
 * Undo diff action type for setting a theme color variable light value.
 */
export const THEME_COLOR_VARIABLE_LIGHT_SET = 'THEME_COLOR_VARIABLE_LIGHT_SET' as const;
/**
 * Undo diff action type for setting a theme color variable dark value.
 */
export const THEME_COLOR_VARIABLE_DARK_SET = 'THEME_COLOR_VARIABLE_DARK_SET' as const;
/**
 * Undo diff action type for setting a theme contrast variable light value.
 */
export const THEME_CONTRAST_VARIABLE_LIGHT_VALUE_SET = 'THEME_CONTRAST_VARIABLE_LIGHT_VALUE_SET' as const;
/**
 * Undo diff action type for setting a theme contrast variable light minimum.
 */
export const THEME_CONTRAST_VARIABLE_LIGHT_MIN_SET = 'THEME_CONTRAST_VARIABLE_LIGHT_MIN_SET' as const;
/**
 * Undo diff action type for setting a theme contrast variable light maximum.
 */
export const THEME_CONTRAST_VARIABLE_LIGHT_MAX_SET = 'THEME_CONTRAST_VARIABLE_LIGHT_MAX_SET' as const;
/**
 * Undo diff action type for setting a theme contrast variable light method.
 */
export const THEME_CONTRAST_VARIABLE_LIGHT_METHOD_SET = 'THEME_CONTRAST_VARIABLE_LIGHT_METHOD_SET' as const;
/**
 * Undo diff action type for setting a theme contrast variable dark value.
 */
export const THEME_CONTRAST_VARIABLE_DARK_VALUE_SET = 'THEME_CONTRAST_VARIABLE_DARK_VALUE_SET' as const;
/**
 * Undo diff action type for setting a theme contrast variable dark minimum.
 */
export const THEME_CONTRAST_VARIABLE_DARK_MIN_SET = 'THEME_CONTRAST_VARIABLE_DARK_MIN_SET' as const;
/**
 * Undo diff action type for setting a theme contrast variable dark maximum.
 */
export const THEME_CONTRAST_VARIABLE_DARK_MAX_SET = 'THEME_CONTRAST_VARIABLE_DARK_MAX_SET' as const;
/**
 * Undo diff action type for setting a theme contrast variable dark method.
 */
export const THEME_CONTRAST_VARIABLE_DARK_METHOD_SET = 'THEME_CONTRAST_VARIABLE_DARK_METHOD_SET' as const;
/**
 * Undo diff action type for enabling use-dark-for-light on a theme contrast variable.
 */
export const THEME_CONTRAST_USE_DARK_FOR_LIGHT_SET = 'THEME_CONTRAST_USE_DARK_FOR_LIGHT_SET' as const;
/**
 * Undo diff action type for enabling use-dark-for-light on a theme color variable.
 */
export const THEME_COLOR_USE_DARK_FOR_LIGHT_SET = 'THEME_COLOR_USE_DARK_FOR_LIGHT_SET' as const;
/**
 * Undo diff action type for setting a theme style variable flag.
 */
export const THEME_STYLE_VARIABLE_FIELD_SET = 'THEME_STYLE_VARIABLE_FIELD_SET' as const;
/**
 * Undo diff action type for enabling use-dark-for-light on a theme style variable.
 */
export const THEME_STYLE_USE_DARK_FOR_LIGHT_SET = 'THEME_STYLE_USE_DARK_FOR_LIGHT_SET' as const;
/**
 * Undo diff action type for setting theme palette apply-to-light.
 */
export const THEME_PALETTE_APPLY_TO_LIGHT_SET = 'THEME_PALETTE_APPLY_TO_LIGHT_SET' as const;
/**
 * Undo diff action type for setting theme palette apply-to-dark.
 */
export const THEME_PALETTE_APPLY_TO_DARK_SET = 'THEME_PALETTE_APPLY_TO_DARK_SET' as const;
/**
 * Undo diff action type for setting theme palette cluster count.
 */
export const THEME_PALETTE_CLUSTER_COUNT_SET = 'THEME_PALETTE_CLUSTER_COUNT_SET' as const;
/**
 * Undo diff action type for recentering theme palette hue.
 */
export const THEME_PALETTE_HUE_RECENTERED = 'THEME_PALETTE_HUE_RECENTERED' as const;
/**
 * Undo diff action type for setting theme palette hue adjustment.
 */
export const THEME_PALETTE_HUE_ADJUSTMENT_SET = 'THEME_PALETTE_HUE_ADJUSTMENT_SET' as const;
/**
 * Undo diff action type for setting theme palette saturation adjustment.
 */
export const THEME_PALETTE_SATURATION_ADJUSTMENT_SET = 'THEME_PALETTE_SATURATION_ADJUSTMENT_SET' as const;
/**
 * Undo diff action type for setting theme palette value adjustment.
 */
export const THEME_PALETTE_VALUE_ADJUSTMENT_SET = 'THEME_PALETTE_VALUE_ADJUSTMENT_SET' as const;
/**
 * Undo diff action type for setting theme palette hue reference.
 */
export const THEME_PALETTE_HUE_REFERENCE_SET = 'THEME_PALETTE_HUE_REFERENCE_SET' as const;
/**
 * Undo diff action type for setting theme pane selections.
 */
export const THEME_PANE_SELECTIONS_SET = 'THEME_PANE_SELECTIONS_SET' as const;
/**
 * Undo diff action type for setting the active theme template.
 */
export const THEME_TEMPLATE_SET = 'THEME_TEMPLATE_SET' as const;
/**
 * Undo diff action type for setting the loaded theme template.
 */
export const THEME_LOADED_TEMPLATE_SET = 'THEME_LOADED_TEMPLATE_SET' as const;
/**
 * Undo diff action type for setting the theme preview token reference.
 */
export const THEME_PREVIEW_TOKEN_REF_SET = 'THEME_PREVIEW_TOKEN_REF_SET' as const;
/**
 * Undo diff action type for incrementing a theme version.
 */
export const THEME_VERSION_INCREMENTED = 'THEME_VERSION_INCREMENTED' as const;
/**
 * Undo diff action type for deleting a theme version.
 */
export const THEME_VERSION_DELETED = 'THEME_VERSION_DELETED' as const;
/**
 * Undo diff action type for creating a new theme.
 */
export const THEME_CREATED = 'THEME_CREATED' as const;

/**
 * All theme undo diff action types registered on the universal undo processor.
 */
export const THEME_UNDO_ACTION_TYPES = [
  THEME_PALETTE_COLOR_ASSIGNED,
  THEME_COLOR_VARIABLE_LIGHT_SET,
  THEME_COLOR_VARIABLE_DARK_SET,
  THEME_CONTRAST_VARIABLE_LIGHT_VALUE_SET,
  THEME_CONTRAST_VARIABLE_LIGHT_MIN_SET,
  THEME_CONTRAST_VARIABLE_LIGHT_MAX_SET,
  THEME_CONTRAST_VARIABLE_LIGHT_METHOD_SET,
  THEME_CONTRAST_VARIABLE_DARK_VALUE_SET,
  THEME_CONTRAST_VARIABLE_DARK_MIN_SET,
  THEME_CONTRAST_VARIABLE_DARK_MAX_SET,
  THEME_CONTRAST_VARIABLE_DARK_METHOD_SET,
  THEME_CONTRAST_USE_DARK_FOR_LIGHT_SET,
  THEME_COLOR_USE_DARK_FOR_LIGHT_SET,
  THEME_STYLE_VARIABLE_FIELD_SET,
  THEME_STYLE_USE_DARK_FOR_LIGHT_SET,
  THEME_PALETTE_APPLY_TO_LIGHT_SET,
  THEME_PALETTE_APPLY_TO_DARK_SET,
  THEME_PALETTE_CLUSTER_COUNT_SET,
  THEME_PALETTE_HUE_RECENTERED,
  THEME_PALETTE_HUE_ADJUSTMENT_SET,
  THEME_PALETTE_SATURATION_ADJUSTMENT_SET,
  THEME_PALETTE_VALUE_ADJUSTMENT_SET,
  THEME_PALETTE_HUE_REFERENCE_SET,
  THEME_PANE_SELECTIONS_SET,
  THEME_TEMPLATE_SET,
  THEME_LOADED_TEMPLATE_SET,
  THEME_PREVIEW_TOKEN_REF_SET,
  THEME_VERSION_INCREMENTED,
  THEME_VERSION_DELETED,
  THEME_CREATED,
] as const;

/**
 * Union of every theme undo diff action type string.
 */
export type ThemeUndoActionType = (typeof THEME_UNDO_ACTION_TYPES)[number];
