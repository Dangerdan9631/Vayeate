import type { SetState } from './types';

export function setGenerateResult(
  setState: SetState,
  result: { success: boolean; message: string } | null,
): void {
  setState({ type: 'SET_GENERATE_RESULT', result });
}
