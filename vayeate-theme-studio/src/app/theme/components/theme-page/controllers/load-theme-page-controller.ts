import { singleton } from 'tsyringe';
import { LoadThemeRefsOperation } from '../../../../../domain/operations/theme-operations/theme-list/load-theme-refs-operation';

@singleton()
export class LoadThemePageController {
  constructor(private readonly loadThemeRefs: LoadThemeRefsOperation) {}

  run(): void {
    this.loadThemeRefs.execute();
  }
}
