import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetCatalogNewSourceTokenTypeOperation } from '../../../operations/catalog-operations/sources/set-catalog-new-source-token-type-operation';
import { SetCatalogNewSourceTypeOperation } from '../../../operations/catalog-operations/sources/set-catalog-new-source-type-operation';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';

@singleton()
export class SetCatalogNewSourceTokenTypeController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly setCatalogNewSourceTokenType: SetCatalogNewSourceTokenTypeOperation,
    private readonly setCatalogNewSourceType: SetCatalogNewSourceTypeOperation,
  ) {}

  run(value: TokenType): void {
    const prevSourceType = this.catalogsStateGetter.current().newSourceType;
    this.setCatalogNewSourceTokenType.execute(value);
    if (
      value !== 'theme' &&
      (prevSourceType === 'color-registry' || prevSourceType === 'color-registry-set')
    ) {
      this.setCatalogNewSourceType.execute('default');
    }
    if (value !== 'semantic token' && prevSourceType === 'semantic-token-registry') {
      this.setCatalogNewSourceType.execute('default');
    }
    if (
      value !== 'textmate token' &&
      (prevSourceType === 'textmate-xml' || prevSourceType === 'textmate-json')
    ) {
      this.setCatalogNewSourceType.execute('default');
    }
  }
}
