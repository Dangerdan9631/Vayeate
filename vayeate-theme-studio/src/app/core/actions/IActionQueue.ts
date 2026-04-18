import type { AppAction } from './app-action';



export interface IActionQueue {
  enqueue(action: AppAction): Promise<void>;
}
