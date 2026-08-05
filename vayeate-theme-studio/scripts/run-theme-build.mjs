import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import electronExecutable from 'electron';
import { build } from 'vite';

const scriptsRoot = dirname(fileURLToPath(import.meta.url));
const studioRoot = resolve(scriptsRoot, '..');
const command = process.argv[2];
const commands = {
  themes: 'theme-build-node.ts',
  screenshots: 'theme-screenshot-cli.ts',
};
const entryName = commands[command];
if (!entryName) {
  console.error('Usage: node scripts/run-theme-build.mjs <themes|screenshots>');
  process.exit(2);
}

const outDir = join(studioRoot, 'temp', 'theme-build-cli');
const bundlePath = join(outDir, `${command}.js`);
await mkdir(outDir, { recursive: true });
await build({
  configFile: false,
  logLevel: 'warn',
  esbuild: {
    tsconfigRaw: {
      compilerOptions: { experimentalDecorators: true },
    },
  },
  build: {
    ssr: join(scriptsRoot, entryName),
    target: 'node20',
    outDir,
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: `${command}.js`,
      },
    },
  },
});

process.chdir(studioRoot);
if (command === 'themes') {
  await import(`${pathToFileURL(bundlePath).href}?run=${Date.now()}`);
} else {
  await writeFile(
    join(outDir, 'package.json'),
    `${JSON.stringify({ private: true, type: 'module', main: `${command}.js` }, null, 2)}\n`,
    'utf8',
  );
  const exitCode = await new Promise((resolveExit, reject) => {
    const child = spawn(electronExecutable, [outDir], {
      cwd: studioRoot,
      stdio: 'inherit',
      windowsHide: true,
      env: {
        ...process.env,
        VAYEATE_THEME_STUDIO_ROOT: studioRoot,
      },
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Theme screenshot process ended with signal ${signal}`));
      } else {
        resolveExit(code ?? 1);
      }
    });
  });
  if (exitCode !== 0) {
    process.exitCode = exitCode;
  }
}
