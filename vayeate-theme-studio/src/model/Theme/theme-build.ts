import type { GeneratedTheme } from './generated-theme';

/**
 * One source theme that could not be generated or captured during a batch build.
 */
export interface ThemeBuildFailure {
  themeName: string;
  version: string;
  message: string;
}

/**
 * Result shared by menu-driven and command-line theme build workflows.
 */
export interface ThemeBatchBuildResult {
  success: boolean;
  generatedCount: number;
  outputPaths: string[];
  failures: ThemeBuildFailure[];
  message: string;
}

/**
 * Generated theme payload and destination used at the screenshot system boundary.
 */
export interface ThemeScreenshotRequest {
  theme: GeneratedTheme;
  outputPath: string;
}

/**
 * Per-file result returned by the screenshot system boundary.
 */
export interface ThemeScreenshotResult {
  outputPath: string;
  success: boolean;
  error?: string;
}
