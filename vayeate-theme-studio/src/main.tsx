import 'reflect-metadata';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/core/components/App';
import { container } from 'tsyringe';
import { InitializeLoggingController } from './domain/controllers/app-controller';
import { AppConfigBootstrapService } from './gateway/services/app-config-bootstrap-service';

container.resolve(InitializeLoggingController).run();
const initialAppConfig = container.resolve(AppConfigBootstrapService).getInitialAppConfig();

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (appRoot) {
  const root = createRoot(appRoot);
  root.render(
    <React.StrictMode>
      <App initialAppConfig={initialAppConfig} />
    </React.StrictMode>
  );
}
