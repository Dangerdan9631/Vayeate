import 'reflect-metadata';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/app/app-shell/App';
import { container } from 'tsyringe';
import { BootstrapAppController } from './app/core/bootstrap/bootstrap-app-controller';
import { ActionQueue } from './app/core/action-queue/action-queue';

container.register("IActionQueue", { useClass: ActionQueue });
void container.resolve(BootstrapAppController).run();

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (appRoot) {
  const root = createRoot(appRoot);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
