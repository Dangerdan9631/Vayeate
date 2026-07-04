const THEME_FILE_PATTERN = /^[a-z0-9-]+(?:-light)?-color-theme\.json$/;

/**
 * Validates that a theme export filename matches the expected VS Code pattern.
 *
 * @param fileName - Candidate output filename to validate.
 * @throws When the filename does not match the theme file name pattern.
 */
export function assertValidThemeFileName(fileName: string): void {
  if (!THEME_FILE_PATTERN.test(fileName)) {
    throw new Error(`Invalid theme output filename: ${fileName}`);
  }
}
