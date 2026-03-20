import { singleton } from 'tsyringe';
import { LoadThemeRefs, LoadPreviews } from '../../../operations/theme-operations';

@singleton()
export class LoadThemeRefsController {
  constructor(
    private readonly loadThemeRefs: LoadThemeRefs,
    private readonly loadPreviews: LoadPreviews,
  ) {}

  async run(): Promise<void> {
    await this.loadThemeRefs.execute();
    await this.loadPreviews.execute();
  }
}

