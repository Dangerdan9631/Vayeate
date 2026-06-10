import type { AppAction } from './app-action';

export type CoalescingStrategy = 'latest' | 'sum-delta';

/**
 * Returns the merged action for latest-only coalescing: the incoming action
 * fully replaces the pending one. Correct for any action whose payload is an
 * absolute value — only the final value matters.
 */
export function mergeLatest(_pending: AppAction, incoming: AppAction): AppAction {
  return incoming;
}

/**
 * Returns the merged action for sum-delta coalescing: the `value` fields are
 * summed and all other fields are taken from the incoming action. Correct for
 * actions whose payload is a true relative increment — dropping intermediates
 * would silently discard accumulated movement.
 *
 * Both actions must carry a numeric `value` property.
 */
export function mergeSumDelta(
  pending: AppAction & { value: number },
  incoming: AppAction & { value: number },
): AppAction & { value: number } {
  return { ...incoming, value: pending.value + incoming.value } as AppAction & { value: number };
}

type CoalescingEntry =
  | { strategy: 'latest' }
  | { strategy: 'sum-delta' };

/**
 * Declarative coalescing policy keyed by action type string.
 *
 * Commit-style actions (*_ON_COMMIT, *_ON_CLOSE, undo-recording) are intentionally
 * absent — they must never be coalesced.
 *
 * Hue and cluster-count sliders are marked latest-only because their dispatch
 * sites send the absolute slider position (not a true increment). Latest-only is
 * lossless for absolute payloads and avoids touching the operations that SET the
 * value directly.
 */
const COALESCING_POLICY = new Map<string, CoalescingEntry>([
  // Absolute value payloads — latest-only
  ['THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT', { strategy: 'latest' }],
  ['APP_EYEDROPPER_OVERLAY_MOUSE_MOVE',           { strategy: 'latest' }],
  ['APP_EYEDROPPER_OVERLAY_VIEWPORT_SIZE_CHANGE', { strategy: 'latest' }],
  ['APP_STYLED_TOOLTIP_ON_POSITION_CHANGE',       { strategy: 'latest' }],
  // Slider drag actions dispatch the absolute slider position, so latest-only
  // is correct — the last value is the definitive one.
  ['THEME_PALETTE_HUE_SLIDER_ON_DELTA',           { strategy: 'latest' }],
  ['THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_DELTA', { strategy: 'latest' }],
  // Text/search inputs — each action carries the full current string
  ['THEME_VARIABLES_SEARCH_TEXT_ON_CHANGE',                    { strategy: 'latest' }],
  ['TEMPLATE_VARIABLES_SEARCH_TEXT_ON_CHANGE',                 { strategy: 'latest' }],
  ['TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE',      { strategy: 'latest' }],
  ['TEMPLATE_MAPPING_SEARCH_TEXT_ON_CHANGE',                   { strategy: 'latest' }],
  ['CATALOG_TOKENS_SEARCH_TEXT_ON_CHANGE',                     { strategy: 'latest' }],
  ['CATALOG_TOKENS_NEW_TOKEN_KEY_TEXT_ON_CHANGE',              { strategy: 'latest' }],
  ['CATALOG_TOKENS_NEW_SEMANTIC_TOKEN_SELECTOR_TEXT_ON_CHANGE', { strategy: 'latest' }],
  ['TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE',                        { strategy: 'latest' }],
  ['CATALOG_DETAILS_NEW_SOURCE_URL_TEXT_ON_CHANGE',            { strategy: 'latest' }],
  ['CATALOG_BULK_ADD_TOKENS_TEXT_ON_CHANGE',                   { strategy: 'latest' }],
  ['TEMPLATE_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',               { strategy: 'latest' }],
  ['THEME_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',                  { strategy: 'latest' }],
]);

/**
 * Attempts to coalesce `incoming` into `pending`.
 *
 * Returns the merged action when both share the same type and a coalescing
 * policy applies, or `null` when no coalescing is possible.
 *
 * The currently-processing action (already shifted out of the queue) must
 * never be passed as `pending` — only queued (not-yet-started) actions are
 * valid candidates.
 */
export function tryCoalesce(pending: AppAction, incoming: AppAction): AppAction | null {
  if (pending.type !== incoming.type) return null;
  const entry = COALESCING_POLICY.get(incoming.type);
  if (!entry) return null;

  if (entry.strategy === 'latest') {
    return mergeLatest(pending, incoming);
  }
  if (entry.strategy === 'sum-delta') {
    return mergeSumDelta(
      pending as AppAction & { value: number },
      incoming as AppAction & { value: number },
    );
  }
  return null;
}
