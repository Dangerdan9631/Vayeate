import { container, injectable } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { ThemeService } from '../../../../gateway/services/theme-service';
import type { AppStateUpdate } from '../../../state/app-state';

@injectable()
export class CreateTheme {
  constructor(private readonly themeService: ThemeService) {}

  async execute(params: { name: string }): Promise<Theme> {
    return await this.themeService.createTheme(params);
  }
}

/** @deprecated Use CreateTheme class instead. */
export async function createTheme(
  _setState: (update: AppStateUpdate) => void,
  params: { name: string },
): Promise<Theme> {
  return container.resolve(CreateTheme).execute(params);
}



