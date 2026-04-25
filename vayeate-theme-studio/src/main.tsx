import 'reflect-metadata';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/app/components/App';
import { container } from 'tsyringe';
import { BootstrapAppController } from './app/core/controllers/bootstrap-app-controller';
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
