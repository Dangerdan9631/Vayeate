
export interface ContinuationHandler {
  then(onResolve: () => void): void;
}
