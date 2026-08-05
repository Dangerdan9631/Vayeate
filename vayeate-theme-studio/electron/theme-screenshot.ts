import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { PROJECT_ROOT, resolveThemeScreenshotExportFile } from './paths';
import {
  buildThemeScreenshotExtensionManifest,
  buildThemeScreenshotExtensionSource,
  buildThemeScreenshotUserSettings,
  type ThemeScreenshotContribution,
  type ThemeScreenshotTheme,
} from './theme-screenshot-host';

const CAPTURE_WIDTH = 1245;
const CAPTURE_HEIGHT = 744;
const HOST_START_TIMEOUT_MS = 30_000;
const THEME_APPLY_TIMEOUT_MS = 15_000;

/**
 * Main-process request for one real VS Code Extension Development Host screenshot.
 */
export interface ThemeScreenshotRequest {
  theme: ThemeScreenshotTheme;
  outputPath: string;
}

/**
 * Main-process result for one Extension Development Host screenshot.
 */
export interface ThemeScreenshotResult {
  outputPath: string;
  success: boolean;
  error?: string;
}

interface DevToolsTarget {
  id: string;
  type: string;
  webSocketDebuggerUrl?: string;
}

interface CdpResponse {
  id?: number;
  result?: unknown;
  error?: { code: number; message: string };
}

class CdpClient {
  private nextId = 0;
  private readonly pending = new Map<number, {
    resolve: (value: unknown) => void;
    reject: (reason: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  }>();

  private constructor(private readonly socket: WebSocket) {
    socket.addEventListener('message', (event: MessageEvent<string>) => {
      const response = JSON.parse(event.data) as CdpResponse;
      if (response.id === undefined) return;
      const pending = this.pending.get(response.id);
      if (!pending) return;
      clearTimeout(pending.timeout);
      this.pending.delete(response.id);
      if (response.error) {
        pending.reject(new Error(response.error.message));
      } else {
        pending.resolve(response.result);
      }
    });
    socket.addEventListener('close', () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timeout);
        pending.reject(new Error('VS Code debugging connection closed'));
      }
      this.pending.clear();
    });
  }

  static async connect(url: string): Promise<CdpClient> {
    const socket = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => resolve(), { once: true });
      socket.addEventListener('error', () => reject(new Error(
        'Unable to connect to the VS Code debugging target',
      )), { once: true });
    });
    return new CdpClient(socket);
  }

  send<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    const id = ++this.nextId;
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`VS Code debugging command timed out: ${method}`));
      }, 10_000);
      this.pending.set(id, {
        resolve: (value) => resolve(value as T),
        reject,
        timeout,
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  closeBrowser(): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ id: ++this.nextId, method: 'Browser.close' }));
    }
  }

  close(): void {
    this.socket.close();
  }
}

function isTheme(value: unknown): value is ThemeScreenshotTheme {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ThemeScreenshotTheme>;
  return typeof candidate.name === 'string'
    && (candidate.type === 'dark' || candidate.type === 'light')
    && !!candidate.colors
    && typeof candidate.colors === 'object'
    && Array.isArray(candidate.tokenColors);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function getAvailablePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  if (port === 0) throw new Error('Unable to allocate a VS Code debugging port');
  return port;
}

async function waitForDevToolsTarget(port: number): Promise<DevToolsTarget> {
  const deadline = Date.now() + HOST_START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const targets = await response.json() as DevToolsTarget[];
        const target = targets.find((candidate) =>
          candidate.type === 'page' && typeof candidate.webSocketDebuggerUrl === 'string',
        );
        if (target) return target;
      }
    } catch {
      // The dedicated VS Code instance is still starting.
    }
    await delay(250);
  }
  throw new Error('VS Code Extension Development Host did not start within 30 seconds');
}

function rgbToHex(value: string): string | null {
  const match = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(value);
  if (!match) return null;
  return `#${match.slice(1, 4).map((part) =>
    Number(part).toString(16).padStart(2, '0')).join('')}`;
}

async function waitForThemeApplied(
  cdp: CdpClient,
  theme: ThemeScreenshotTheme,
): Promise<void> {
  const expectedModeClass = theme.type === 'dark' ? 'vs-dark' : 'vs';
  const expectedBackground = theme.colors['editor.background']?.slice(0, 7).toLowerCase();
  const deadline = Date.now() + THEME_APPLY_TIMEOUT_MS;
  const expression = `(() => {
    const workbench = document.querySelector('.monaco-workbench');
    const editor = document.querySelector('.monaco-editor-background');
    return {
      workbenchClass: workbench?.className ?? '',
      editorBackground: editor ? getComputedStyle(editor).backgroundColor : '',
      title: document.title,
    };
  })()`;

  while (Date.now() < deadline) {
    const response = await cdp.send<{
      result?: { value?: {
        workbenchClass?: string;
        editorBackground?: string;
        title?: string;
      } };
    }>('Runtime.evaluate', { expression, returnByValue: true });
    const value = response.result?.value;
    const correctMode = value?.workbenchClass?.split(/\s+/).includes(expectedModeClass) === true;
    const actualBackground = rgbToHex(value?.editorBackground ?? '');
    const correctBackground = !expectedBackground || actualBackground === expectedBackground;
    const correctHost = value?.title?.includes('[Extension Development Host]') === true;
    if (correctMode && correctBackground && correctHost) return;
    await delay(100);
  }
  throw new Error(`VS Code did not finish applying ${theme.name}`);
}

async function waitForReadyFile(extensionRoot: string, requestId: number): Promise<void> {
  const deadline = Date.now() + THEME_APPLY_TIMEOUT_MS;
  const readyPath = join(extensionRoot, 'ready.json');
  while (Date.now() < deadline) {
    try {
      const ready = JSON.parse(await readFile(readyPath, 'utf8')) as {
        id?: number;
        error?: string;
      };
      if (ready.error) throw new Error(ready.error);
      if (ready.id === requestId) return;
    } catch (error) {
      if (error instanceof Error && !('code' in error && error.code === 'ENOENT')) {
        throw error;
      }
    }
    await delay(100);
  }
  throw new Error('VS Code screenshot extension did not acknowledge the theme request');
}

async function waitForChildExit(child: ChildProcess, timeoutMs: number): Promise<void> {
  if (child.exitCode !== null) return;
  await Promise.race([
    new Promise<void>((resolve) => child.once('exit', () => resolve())),
    delay(timeoutMs),
  ]);
}

/**
 * Captures all requested variants from one isolated real VS Code Extension Development Host.
 */
export async function generateThemeScreenshots(
  requests: readonly ThemeScreenshotRequest[],
): Promise<ThemeScreenshotResult[]> {
  if (!Array.isArray(requests) || requests.length > 500) {
    throw new Error('Invalid theme screenshot request list');
  }
  if (requests.length === 0) return [];
  for (const request of requests) {
    if (!request || !isTheme(request.theme) || typeof request.outputPath !== 'string') {
      throw new Error('Invalid theme screenshot request');
    }
  }

  const sessionRoot = join(
    PROJECT_ROOT,
    'temp',
    `vscode-theme-screenshot-${process.pid}-${Date.now()}`,
  );
  const extensionRoot = join(sessionRoot, 'extension');
  const themesRoot = join(extensionRoot, 'themes');
  const userDataRoot = join(sessionRoot, 'user-data');
  const userSettingsRoot = join(userDataRoot, 'User');
  const extensionsRoot = join(sessionRoot, 'extensions');
  const examplesRoot = join(PROJECT_ROOT, '..', 'examples');
  const exampleFile = join(examplesRoot, 'Example', 'Example.cs');
  const workspaceFile = join(sessionRoot, 'examples.code-workspace');
  const contributions: ThemeScreenshotContribution[] = requests.map((request, index) => ({
    label: `Vayeate Screenshot ${index + 1}: ${request.theme.name}`,
    uiTheme: request.theme.type === 'dark' ? 'vs-dark' : 'vs',
    path: `./themes/theme-${String(index + 1).padStart(3, '0')}.json`,
  }));
  const port = await getAvailablePort();
  const results: ThemeScreenshotResult[] = [];
  let child: ChildProcess | null = null;
  let cdp: CdpClient | null = null;

  try {
    await Promise.all([
      mkdir(themesRoot, { recursive: true }),
      mkdir(userSettingsRoot, { recursive: true }),
      mkdir(extensionsRoot, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        join(extensionRoot, 'package.json'),
        `${JSON.stringify(buildThemeScreenshotExtensionManifest(contributions), null, 2)}\n`,
        'utf8',
      ),
      writeFile(
        join(extensionRoot, 'extension.js'),
        buildThemeScreenshotExtensionSource(exampleFile),
        'utf8',
      ),
      writeFile(
        join(userSettingsRoot, 'settings.json'),
        `${JSON.stringify(buildThemeScreenshotUserSettings(contributions[0].label), null, 2)}\n`,
        'utf8',
      ),
      writeFile(
        join(extensionRoot, 'control.json'),
        JSON.stringify({ id: 1, themeLabel: contributions[0].label }),
        'utf8',
      ),
      ...requests.map((request, index) => writeFile(
        join(themesRoot, `theme-${String(index + 1).padStart(3, '0')}.json`),
        `${JSON.stringify(request.theme, null, 2)}\n`,
        'utf8',
      )),
      writeFile(
        workspaceFile,
        `${JSON.stringify({ folders: [{ path: examplesRoot }], settings: {} }, null, 2)}\n`,
        'utf8',
      ),
    ]);

    const codeArguments = [
      '--new-window',
      '--wait',
      '--skip-welcome',
      '--disable-workspace-trust',
      '--disable-telemetry',
      '--disable-updates',
      `--extensionDevelopmentPath=${extensionRoot}`,
      `--extensions-dir=${extensionsRoot}`,
      `--user-data-dir=${userDataRoot}`,
      `--remote-debugging-port=${port}`,
      workspaceFile,
    ];
    const isWindows = process.platform === 'win32';
    const command = isWindows ? (process.env.ComSpec ?? 'cmd.exe') : 'code';
    const launchArguments = isWindows
      ? ['/d', '/s', '/c', 'code.cmd', ...codeArguments]
      : codeArguments;
    child = spawn(
      command,
      launchArguments,
      {
        cwd: extensionRoot,
        stdio: 'ignore',
        windowsHide: true,
      },
    );
    const target = await waitForDevToolsTarget(port);
    cdp = await CdpClient.connect(target.webSocketDebuggerUrl!);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: CAPTURE_WIDTH,
      height: CAPTURE_HEIGHT,
      deviceScaleFactor: 1,
      mobile: false,
    });

    for (let index = 0; index < requests.length; index += 1) {
      const request = requests[index];
      const requestId = index + 1;
      try {
        if (index > 0) {
          await writeFile(
            join(extensionRoot, 'control.json'),
            JSON.stringify({
              id: requestId,
              themeLabel: contributions[index].label,
            }),
            'utf8',
          );
        }
        await waitForReadyFile(extensionRoot, requestId);
        await waitForThemeApplied(cdp, request.theme);
        await delay(300);
        const screenshot = await cdp.send<{ data: string }>('Page.captureScreenshot', {
          format: 'png',
          captureBeyondViewport: false,
          fromSurface: true,
        });
        const png = Buffer.from(screenshot.data, 'base64');
        if (png.length === 0) throw new Error('VS Code capture produced an empty PNG');
        const outputFile = resolveThemeScreenshotExportFile(request.outputPath);
        await mkdir(dirname(outputFile), { recursive: true });
        await writeFile(outputFile, png);
        results.push({ outputPath: request.outputPath, success: true });
      } catch (error) {
        results.push({
          outputPath: request.outputPath,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const completedPaths = new Set(results.map((result) => result.outputPath));
    for (const request of requests) {
      if (!completedPaths.has(request.outputPath)) {
        results.push({ outputPath: request.outputPath, success: false, error: message });
      }
    }
  } finally {
    cdp?.closeBrowser();
    await delay(500);
    cdp?.close();
    if (child) {
      await waitForChildExit(child, 5_000);
      if (child.exitCode === null) child.kill();
    }
    try {
      await rm(sessionRoot, {
        recursive: true,
        force: true,
        maxRetries: 20,
        retryDelay: 250,
      });
    } catch {
      // A closing VS Code process can briefly retain Chromium files; screenshot results remain valid.
    }
  }

  return results;
}
