import type { Theme } from '../model/schemas.js';

const TAG = '[ThemeController]';

export interface CreateThemeParams {
  name: string;
}

export function createThemeWithParams(params: CreateThemeParams): Theme {
  console.debug(TAG, 'createThemeWithParams', params.name);
  return {
    name: params.name,
    version: '1.0.0',
    templateRef: null,
    idePrimaryColorVariableRef: null,
    themeBackgroundColorVariableRef: null,
    colorAssignments: [],
    contrastAssignments: [],
  };
}
