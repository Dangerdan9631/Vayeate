import { singleton } from 'tsyringe';

const THEME_FILE_PATTERN = /^[a-z0-9-]+(?:-light)?-color-theme\.json$/;

/**
 * Validates that a theme export filename matches the expected VS Code pattern.
 */
@singleton()
export class ValidateIsThemeFileNameValid {
  /**
   * @param fileName - Candidate output filename to validate.
   * @returns `true` when the filename matches the theme file name pattern.
   */
  test(fileName: string): boolean {
    return THEME_FILE_PATTERN.test(fileName);
  }
}
