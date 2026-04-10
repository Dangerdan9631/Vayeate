import { describe, expect, it, vi } from 'vitest';
import { ScreenshotService } from '../../../../gateway/services/screenshot-service';
import { UiStateGetter, UiStateSetter } from '../../../state/ui/ui-state-reducer';
import { initialUiState } from '../../../state/ui/ui-state';
import { LoadEyedropperSnapshotOperation } from './load-eyedropper-snapshot-operation';

describe('LoadEyedropperSnapshotOperation', () => {
  it('maps snapshot to ui ready state on success', async () => {
    const apply = vi.fn();
    const uiStateSetter = new UiStateSetter(apply);
    const screenshotService = {
      getFullDisplaySnapshot: vi.fn().mockResolvedValue({
        fullBounds: { x: 0, y: 0, width: 100, height: 50 },
        displays: [
          {
            sourceId: 's1',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            png: new Uint8Array([1, 2, 3]),
          },
        ],
      }),
    } as unknown as ScreenshotService;
    const uiStateGetter = new UiStateGetter(() => initialUiState);
    const op = new LoadEyedropperSnapshotOperation(uiStateSetter, uiStateGetter, screenshotService);
    await op.execute('eyedropper:hue');
    expect(apply).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_UI_EYEDROPPER',
        eyedropper: expect.objectContaining({
          phase: 'ready',
          contextKey: 'eyedropper:hue',
          errorMessage: null,
          result: null,
          pendingPostCommit: null,
        }),
      }),
    );
    const payload = apply.mock.calls[0][0].eyedropper.snapshot;
    expect(payload.displays[0].png).toBeInstanceOf(Uint8Array);
  });

  it('sets error state on failure', async () => {
    const apply = vi.fn();
    const uiStateSetter = new UiStateSetter(apply);
    const screenshotService = {
      getFullDisplaySnapshot: vi.fn().mockRejectedValue(new Error('ipc failed')),
    } as unknown as ScreenshotService;
    const uiStateGetter = new UiStateGetter(() => initialUiState);
    const op = new LoadEyedropperSnapshotOperation(uiStateSetter, uiStateGetter, screenshotService);
    await op.execute('eyedropper:dark:foo');
    expect(apply).toHaveBeenCalledWith({
      type: 'SET_UI_EYEDROPPER',
      eyedropper: {
        phase: 'error',
        contextKey: 'eyedropper:dark:foo',
        snapshot: null,
        errorMessage: 'ipc failed',
        result: null,
        pendingPostCommit: null,
      },
    });
  });
});
