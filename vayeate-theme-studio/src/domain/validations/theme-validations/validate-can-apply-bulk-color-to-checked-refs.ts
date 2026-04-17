import { singleton } from 'tsyringe';
import type { Theme } from '../../../model/schema/theme-schemas';

/** Theme edit targets exist and at least one color ref is selected for palette/hue actions. */
@singleton()
export class ValidateCanApplyBulkColorToCheckedRefs {
  test(theme: Theme | null | undefined, checkedCount: number): boolean {
    return !!theme && checkedCount > 0;
  }
}
