/**
 * Electron-side wire shape for a generated VS Code theme.
 */
export interface ThemeScreenshotTheme {
  name: string;
  type: 'dark' | 'light';
  colors: Record<string, string>;
  tokenColors: Array<{
    name: string;
    scope: string[];
    settings: { foreground?: string; fontStyle?: string };
  }>;
  semanticHighlighting?: boolean;
  semanticTokenColors?: Record<string, unknown>;
}

export const SCREENSHOT_DARK_THEME_LABEL = 'Vayeate Screenshot Dark';
export const SCREENSHOT_LIGHT_THEME_LABEL = 'Vayeate Screenshot Light';

/**
 * One color-theme contribution registered by the temporary screenshot extension.
 */
export interface ThemeScreenshotContribution {
  label: string;
  uiTheme: 'vs-dark' | 'vs';
  path: string;
}

const defaultThemeContributions: ThemeScreenshotContribution[] = [
  {
    label: SCREENSHOT_DARK_THEME_LABEL,
    uiTheme: 'vs-dark',
    path: './themes/active-color-theme.json',
  },
  {
    label: SCREENSHOT_LIGHT_THEME_LABEL,
    uiTheme: 'vs',
    path: './themes/active-light-color-theme.json',
  },
];

/**
 * Builds the temporary extension manifest used by the screenshot Extension Development Host.
 */
export function buildThemeScreenshotExtensionManifest(
  themes: readonly ThemeScreenshotContribution[] = defaultThemeContributions,
) {
  return {
    name: 'vayeate-theme-screenshot-host',
    displayName: 'Vayeate Theme Screenshot Host',
    description: 'Temporary color-theme extension used for automated screenshots.',
    publisher: 'vayeate-theme-studio',
    version: '0.0.0',
    engines: { vscode: '^1.76.0' },
    categories: ['Themes'],
    main: './extension.js',
    activationEvents: ['onStartupFinished'],
    contributes: {
      themes,
    },
  };
}

/**
 * Builds isolated VS Code settings for a quiet, repeatable screenshot workbench.
 */
export function buildThemeScreenshotUserSettings(initialThemeLabel: string) {
  return {
    'workbench.colorTheme': initialThemeLabel,
    'window.autoDetectColorScheme': false,
    'window.commandCenter': false,
    'window.menuBarVisibility': 'visible',
    'window.restoreWindows': 'none',
    'workbench.startupEditor': 'none',
    'workbench.secondarySideBar.defaultVisibility': 'hidden',
    'workbench.tips.enabled': false,
    'workbench.enableExperiments': false,
    'extensions.ignoreRecommendations': true,
    'git.openRepositoryInParentFolders': 'never',
    'security.workspace.trust.enabled': false,
    'telemetry.telemetryLevel': 'off',
    'update.mode': 'none',
  };
}

/**
 * Builds the tiny development extension that applies theme requests and prepares the editor.
 */
export function buildThemeScreenshotExtensionSource(exampleFilePath: string): string {
  return `'use strict';
const vscode = require('vscode');
const fs = require('node:fs/promises');
const path = require('node:path');

const EXAMPLE_FILE = ${JSON.stringify(exampleFilePath)};
let processing = false;
let lastRequestId = null;

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function tryCommand(command) {
  try {
    await vscode.commands.executeCommand(command);
  } catch {
    // Commands vary slightly between VS Code releases; optional cleanup may be unavailable.
  }
}

async function processControl(extensionPath) {
  if (processing) return;
  processing = true;
  try {
    const controlPath = path.join(extensionPath, 'control.json');
    const raw = await fs.readFile(controlPath, 'utf8');
    const request = JSON.parse(raw);
    if (!Number.isInteger(request.id) || request.id === lastRequestId) return;
    if (typeof request.themeLabel !== 'string') return;

    await vscode.workspace.getConfiguration('workbench').update(
      'colorTheme',
      request.themeLabel,
      vscode.ConfigurationTarget.Global,
    );
    await tryCommand('workbench.action.closeAuxiliaryBar');
    await tryCommand('workbench.action.closePanel');
    await tryCommand('notifications.clearAll');

    const document = await vscode.workspace.openTextDocument(EXAMPLE_FILE);
    const editor = await vscode.window.showTextDocument(document, {
      preview: false,
      preserveFocus: false,
    });
    const line = Math.min(34, Math.max(0, document.lineCount - 1));
    editor.selection = new vscode.Selection(line, 0, line, 0);
    editor.revealRange(
      new vscode.Range(line, 0, Math.min(line + 20, document.lineCount - 1), 0),
      vscode.TextEditorRevealType.InCenter,
    );
    await tryCommand('workbench.action.focusFirstEditorGroup');
    await delay(250);

    lastRequestId = request.id;
    await fs.writeFile(
      path.join(extensionPath, 'ready.json'),
      JSON.stringify({ id: request.id }),
      'utf8',
    );
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      await fs.writeFile(
        path.join(extensionPath, 'ready.json'),
        JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
        'utf8',
      );
    }
  } finally {
    processing = false;
  }
}

function activate(context) {
  const run = () => void processControl(context.extensionPath);
  const interval = setInterval(run, 100);
  context.subscriptions.push({ dispose: () => clearInterval(interval) });
  run();
}

function deactivate() {}

module.exports = { activate, deactivate };
`;
}
