import { container, injectable } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import type { AppStateUpdate } from '../../../state/app-state';

@injectable()
export class CreateThemeOperation {
  constructor(private readonly themeGateway: ThemeGateway) {}

  async execute(params: { name: string }): Promise<Theme> {
    return await this.themeGateway.createTheme(params);
  }
}

/** @deprecated Use CreateThemeOperation class instead. */
export async function createTheme(
  _setState: (update: AppStateUpdate) => void,
  params: { name: string },
): Promise<Theme> {
  return container.resolve(CreateThemeOperation).execute(params);
}



