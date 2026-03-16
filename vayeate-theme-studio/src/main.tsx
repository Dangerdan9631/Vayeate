import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/ui/App';
import { initLogTransport } from './domain/utils/logger';
import { sendLog } from './gateway/services/log-service';
import { initEyedropperTransport } from './app/ui/utils/eyedropper';
import {
  getScreenSourcesWithBounds,
  isElectronEyedropperAvailable,
} from './gateway/services/eyedropper-service';
import { initWindowEventTransport } from './app/ui/context/window-event-transport';
import { windowService } from './gateway/services/window-service';

initLogTransport(sendLog);
initEyedropperTransport(
  isElectronEyedropperAvailable() ? getScreenSourcesWithBounds : undefined,
);
initWindowEventTransport({
  onWindowState: windowService.onWindowState,
  onWindowResize: windowService.onWindowResize,
  onWindowMove: windowService.onWindowMove,
});

// Forward main process logs to this console so all Theme Studio logs appear in DevTools
window.electronAPI?.onMainLog?.((level, args) => {
  const method = level === 'debug' ? 'debug' : level === 'info' ? 'info' : level === 'warn' ? 'warn' : 'error';
  console[method]('[Main]', ...args);
});

const container = document.querySelector<HTMLDivElement>('#app');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
