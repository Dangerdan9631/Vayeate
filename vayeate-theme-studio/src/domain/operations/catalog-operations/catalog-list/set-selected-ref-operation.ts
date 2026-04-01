import { injectable } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetSelectedRefOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(ref: CatalogReference | null): void {
    this.appStateSetter.apply({ type: 'SET_SELECTED_REF', ref });
  }
}



