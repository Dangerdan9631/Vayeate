import { setThemePreviewSelectedSampleKey as setThemePreviewSelectedSampleKeyOp, type SetState } from '../../operations/theme-operations';

export function setPreviewSelectedSample(setState: SetState, value: string): void {
  setThemePreviewSelectedSampleKeyOp(setState, value);
}
