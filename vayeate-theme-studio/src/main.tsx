import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { createLogger, getLogLevel } from './utils/logger';

const log = createLogger('Main');

log.info('Vayeate Theme Studio starting', `(logLevel=${getLogLevel()})`);

// Forward main process logs to this console so all Theme Studio logs appear in DevTools
window.electronAPI?.onMainLog?.((level, args) => {
  const method = level === 'debug' ? 'debug' : level === 'info' ? 'info' : level === 'warn' ? 'warn' : 'error';
  console[method]('[Main]', ...args);
});

const container = document.querySelector<HTMLDivElement>('#app');
if (container) {
  log.debug('mounting React app');
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  log.error('could not find #app container');
}
