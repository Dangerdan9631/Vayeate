import { describe, expect, it } from 'vitest';
import { StyledTooltipUiStore } from './state/ui/styled-tooltip-ui-store';
import { EyedropperUiStore } from './state/ui/eyedropper-ui-store';
import { ThemePreviewStore } from './state/ui/theme-preview-store';
import { EyedropperCommitTargetType } from '../model/eyedropper';
import type { StyledTooltipState } from '../model/styled-tooltip';
import type { ThemePaneState } from '../model/theme-pane-state';

describe('component ui state ownership', () => {
  it('keeps coordinated tooltip state in the dedicated tooltip ui store', () => {
    const store = new StyledTooltipUiStore();
    const tooltip: StyledTooltipState = { text: 'Open settings', x: 12, y: 24 };

    store.getStore().showTooltip(tooltip);
    expect(store.getStore().state.tooltip).toEqual(tooltip);

    store.getStore().repositionTooltip({ x: 30, y: 48 });
    expect(store.getStore().state.tooltip).toEqual({
      text: 'Open settings',
      x: 30,
      y: 48,
    });

    store.getStore().hideTooltip();
    expect(store.getStore().state.tooltip).toBeNull();
  });

  it('keeps coordinated eyedropper state in the dedicated eyedropper ui store', () => {
    const store = new EyedropperUiStore();

    store.getStore().openEyedropper({ type: EyedropperCommitTargetType.ThemePaletteAssignColor });
    store.getStore().setEyedropperOverlayViewportSize({ width: 800, height: 600 });
    store.getStore().setEyedropperZoom(3);
    store.getStore().setEyedropperPointer({
      clientPosition: { x: 20, y: 30 },
      canvasPosition: { x: 10, y: 15 },
      previewHex: '#abcdef',
    });
    store.getStore().setEyedropperErrorMessage('Snapshot failed');

    expect(store.getStore().state).toMatchObject({
      isOpen: true,
      overlayViewportSize: { width: 800, height: 600 },
      zoom: 3,
      pointer: {
        clientPosition: { x: 20, y: 30 },
        canvasPosition: { x: 10, y: 15 },
        previewHex: '#abcdef',
      },
      errorMessage: 'Snapshot failed',
    });

    store.getStore().closeEyedropper();
    expect(store.getStore().state.isOpen).toBe(false);
    expect(store.getStore().state.pointer).toBeNull();
  });

  it('keeps preview pane snapshots typed and owned by the theme preview store', () => {
    const paneState: ThemePaneState = {
      theme: null,
      checkedColorRefs: ['editorFg'],
      checkedContrastRefs: ['contrastMain'],
      hueAdjustment: 5,
      saturationAdjustment: 0,
      valueAdjustment: 0,
      hueReferenceHex: '#ff0000',
    };

    const store = new ThemePreviewStore();
    store.getStore().setLoadedTemplate({
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [],
      colorVariables: [],
      contrastVariables: [],
      groups: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    });

    expect(paneState).toEqual({
      theme: null,
      checkedColorRefs: ['editorFg'],
      checkedContrastRefs: ['contrastMain'],
      hueAdjustment: 5,
      saturationAdjustment: 0,
      valueAdjustment: 0,
      hueReferenceHex: '#ff0000',
    });
    expect(store.getStore().state.loadedTemplateForTheme).toEqual(
      expect.objectContaining({
        name: 'template-a',
        version: '1.0.0',
      }),
    );
  });
});
