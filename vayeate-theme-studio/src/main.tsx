import 'reflect-metadata';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/app/app-shell/App';
import { container, DependencyContainer } from 'tsyringe';
import { BootstrapAppController } from './app/core/bootstrap/bootstrap-app-controller';
import { ActionQueue } from './app/core/action-queue/action-queue';
import { EnqueueBackgroundQueueActionOperation } from './domain/operations/background-queue/enqueue-background-queue-action-operation';
import { SignalBackgroundQueueProcessingCompleteController } from './app/core/background-queue/controllers/signal-background-queue-processing-complete-controller';
import { UpdateBackgroundQueueStatusController } from './app/core/background-queue/controllers/update-background-queue-status-controller';
import { SerialQueue } from './app/core/background-queue/serial-queue';
import { LoggerFactory } from './domain/utils/logger';
import { PooledQueue } from './app/core/background-queue/pooled-queue';

export const BACKGROUND_QUEUE_WORKER_CONCURRENCY_LIMIT = 16;

container.register("IActionQueue", { useClass: ActionQueue });
container.register("IBackgroundMainQueue", {
  useFactory: (c: DependencyContainer) => new SerialQueue(
    'main',
    c.resolve(EnqueueBackgroundQueueActionOperation),
    c.resolve(UpdateBackgroundQueueStatusController),
    c.resolve(SignalBackgroundQueueProcessingCompleteController),
    c.resolve(LoggerFactory)
  )
});
container.register("IBackgroundWorkerQueue", {
  useFactory: (c: DependencyContainer) => new PooledQueue(
    'worker',
    BACKGROUND_QUEUE_WORKER_CONCURRENCY_LIMIT,
    c.resolve(EnqueueBackgroundQueueActionOperation),
    c.resolve(UpdateBackgroundQueueStatusController),
    c.resolve(SignalBackgroundQueueProcessingCompleteController),
    c.resolve(LoggerFactory)
  )
});
container.register("IBackgroundDataIoQueue", {
  useFactory: (c: DependencyContainer) => new SerialQueue(
    'data_io',
    c.resolve(EnqueueBackgroundQueueActionOperation),
    c.resolve(UpdateBackgroundQueueStatusController),
    c.resolve(SignalBackgroundQueueProcessingCompleteController),
    c.resolve(LoggerFactory)
  )
});

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
