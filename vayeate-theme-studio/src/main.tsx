import 'reflect-metadata';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/ui/App';
import { container } from 'tsyringe';
import { InitializeLoggingController } from './domain/controllers/app-controller';

container.resolve(InitializeLoggingController).run();

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (appRoot) {
  const root = createRoot(appRoot);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
