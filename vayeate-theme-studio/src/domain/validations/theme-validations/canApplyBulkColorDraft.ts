import type { Theme } from '../../../model/schemas';

/** Theme edit targets exist and at least one color ref is selected for palette/hue actions. */
export function canApplyBulkColorToCheckedRefs(theme: Theme | null | undefined, checkedCount: number): theme is Theme {
  return !!theme && checkedCount > 0;
}
