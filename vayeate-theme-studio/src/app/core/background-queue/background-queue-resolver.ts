import { ContinuationHandler } from './continuation-handler';

const noop = () => { };

export class BackgroundQueueResolver implements ContinuationHandler {
  private resolve: () => void = noop;

  onResolve(): void {
    this.resolve();
  }

  then(onResolve: () => void): void {
    this.resolve = onResolve;
  }
}
