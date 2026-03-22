import 'reflect-metadata';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { container as diContainer } from 'tsyringe';
import { App } from './app/ui/App';
import { initLogTransport } from './domain/utils/logger';
import { LogService } from './gateway/services/log-service';
import { initEyedropperTransport } from './app/ui/utils/eyedropper';
import { EyedropperService } from './gateway/services/eyedropper-service';
import { initWindowEventTransport } from './app/ui/context/window-event-transport';
import { WindowService } from './gateway/services/window-service';

const logService = diContainer.resolve(LogService);
initLogTransport((level, tag, args) => logService.send(level, tag, args));
const eyedropperService = diContainer.resolve(EyedropperService);
initEyedropperTransport(
  eyedropperService.isAvailable()
    ? eyedropperService.getScreenSourcesWithBounds.bind(eyedropperService)
    : undefined,
);
const windowService = diContainer.resolve(WindowService);
initWindowEventTransport({
  onWindowState: windowService.onWindowState.bind(windowService),
  onWindowResize: windowService.onWindowResize.bind(windowService),
  onWindowMove: windowService.onWindowMove.bind(windowService),
});

// Forward main process logs to this console so all Theme Studio logs appear in DevTools
window.electronAPI?.onMainLog?.((level, args) => {
  const method = level === 'debug' ? 'debug' : level === 'info' ? 'info' : level === 'warn' ? 'warn' : 'error';
  console[method]('[Main]', ...args);
});

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (appRoot) {
  const root = createRoot(appRoot);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
