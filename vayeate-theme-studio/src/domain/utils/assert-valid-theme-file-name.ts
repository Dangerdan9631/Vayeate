const THEME_FILE_PATTERN = /^[a-z0-9-]+(?:-light)?-color-theme\.json$/;

export function assertValidThemeFileName(fileName: string): void {
  if (!THEME_FILE_PATTERN.test(fileName)) {
    throw new Error(`Invalid theme output filename: ${fileName}`);
  }
}
