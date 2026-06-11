import type { AppAction } from './app-action';

export type ActionCoalesceFn<A extends AppAction = AppAction> = (pending: A, incoming: A) => A;

/**
 * Returns the merged action for latest-only coalescing: the incoming action
 * fully replaces the pending one. Correct for any action whose payload is an
 * absolute value — only the final value matters.
 */
export function coalesceLatest<A extends AppAction>(_pending: A, incoming: A): A {
  return incoming;
}

/**
 * Returns the merged action for sum-value coalescing: the `value` fields are
 * summed and all other fields are taken from the incoming action. Correct for
 * actions whose payload is a true relative increment — dropping intermediates
 * would silently discard accumulated movement.
 */
export function coalesceSumValue<A extends AppAction & { value: number }>(pending: A, incoming: A): A {
  return { ...incoming, value: pending.value + incoming.value };
}

/** Wrap a discriminated merge with compile-time payload typing. */
export function actionCoalescer<T extends AppAction['type']>(
  fn: (
    pending: Extract<AppAction, { type: T }>,
    incoming: Extract<AppAction, { type: T }>,
  ) => Extract<AppAction, { type: T }>,
): ActionCoalesceFn {
  return fn as unknown as ActionCoalesceFn;
}
