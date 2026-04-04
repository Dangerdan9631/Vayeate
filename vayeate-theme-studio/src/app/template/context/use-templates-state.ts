import { useContextSelector } from 'use-context-selector';
import type { TemplatesState } from '../../../domain/state/template/templates-state';
import { AppContext } from '../../core/context/AppContext';

export function useTemplatesState(): TemplatesState {
  const slice = useContextSelector(AppContext, (c) => c?.state.templates);
  if (slice === undefined) {
    throw new Error('useTemplatesState must be used within AppProvider');
  }
  return slice;
}
