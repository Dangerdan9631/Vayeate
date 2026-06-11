import { useMemo, useRef } from 'react';
import type { ContrastVariable, Mapping } from '../../../model/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment } from '../../../model/schema/theme-schemas';
import type { TokenizedPreview } from '../../../model/preview-types';
import {
  previewLineFingerprint,
  resolvePreviewLine,
  type PreviewTokenTooltipContext,
  type ResolvedPreviewLine,
} from '../../../domain/utils/resolve-editor-preview-lines';
import {
  buildScopeColorMap,
  hashScopeColorMapInputs,
  selectScopeColorMapInputs,
  type ScopeColorMap,
} from '../../../domain/utils/scope-resolver';

/**
 * Resolved preview lines and cache key for one editor preview sample.
 */
export interface ResolvedPreview {
  previewKey: string;
  lines: ResolvedPreviewLine[];
}

/**
 * Hook used by the Editor Previews Card to derive presentation state.
 */
export function useResolvedEditorPreviews(params: {
  previews: readonly TokenizedPreview[];
  mappings: readonly Mapping[];
  colorAssignments: readonly ColorAssignment[];
  contrastAssignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
  defaultEditorFgDark: string;
  defaultEditorFgLight: string;
  visibleIndices: readonly number[];
}): {
  scopeColorMap: ScopeColorMap;
  scopeColorMapVersion: string;
  tooltipContext: PreviewTokenTooltipContext;
  getResolvedPreview: (index: number) => ResolvedPreview | undefined;
} {
  const {
    previews,
    mappings,
    colorAssignments,
    contrastAssignments,
    contrastVariables,
    defaultEditorFgDark,
    defaultEditorFgLight,
    visibleIndices,
  } = params;

  const scopeColorMapInputs = useMemo(
    () => selectScopeColorMapInputs(mappings, colorAssignments, contrastAssignments, contrastVariables),
    [mappings, colorAssignments, contrastAssignments, contrastVariables],
  );
  const scopeColorMapVersion = useMemo(
    () => hashScopeColorMapInputs(scopeColorMapInputs),
    [scopeColorMapInputs],
  );

  const scopeColorMapRef = useRef<{ version: string; map: ScopeColorMap } | null>(null);
  if (!scopeColorMapRef.current || scopeColorMapRef.current.version !== scopeColorMapVersion) {
    scopeColorMapRef.current = {
      version: scopeColorMapVersion,
      map: buildScopeColorMap(mappings, colorAssignments, contrastAssignments, contrastVariables),
    };
  }
  const scopeColorMap = scopeColorMapRef.current.map;

  const tooltipContext = useMemo(
    (): PreviewTokenTooltipContext => ({
      colorAssignments,
      contrastAssignments,
      contrastVariables,
    }),
    [colorAssignments, contrastAssignments, contrastVariables],
  );

  const lineCacheRef = useRef<Map<string, ResolvedPreviewLine>>(new Map());
  const previewCacheRef = useRef<Map<string, ResolvedPreview>>(new Map());

  if (previewCacheRef.current.size > 0) {
    const firstKey = previewCacheRef.current.keys().next().value;
    if (firstKey != null && !firstKey.endsWith(`:${scopeColorMapVersion}`)) {
      lineCacheRef.current.clear();
      previewCacheRef.current.clear();
    }
  }

  const visibleKey = visibleIndices.join(',');
  const getResolvedPreview = useMemo(() => {
    const lineCache = lineCacheRef.current;
    const previewCache = previewCacheRef.current;
    const version = scopeColorMapVersion;
    const map = scopeColorMap;
    const fgDark = defaultEditorFgDark;
    const fgLight = defaultEditorFgLight;
    const previewList = previews;

    for (const index of visibleIndices) {
      const preview = previewList[index];
      if (!preview) continue;
      const previewCacheKey = `${index}:${version}`;
      if (previewCache.has(previewCacheKey)) continue;

      const lines = preview.lines.map((line) => {
        const lineCacheKey = `${previewLineFingerprint(line)}:${version}`;
        const cachedLine = lineCache.get(lineCacheKey);
        if (cachedLine) return cachedLine;
        const resolvedLine = resolvePreviewLine(line, map, fgDark, fgLight);
        lineCache.set(lineCacheKey, resolvedLine);
        return resolvedLine;
      });

      previewCache.set(previewCacheKey, {
        previewKey: `${preview.language}/${preview.fileName}`,
        lines,
      });
    }

    return (index: number): ResolvedPreview | undefined => {
      const previewCacheKey = `${index}:${version}`;
      return previewCache.get(previewCacheKey);
    };
  }, [
    visibleIndices,
    visibleKey,
    previews,
    scopeColorMap,
    scopeColorMapVersion,
    defaultEditorFgDark,
    defaultEditorFgLight,
  ]);

  return {
    scopeColorMap,
    scopeColorMapVersion,
    tooltipContext,
    getResolvedPreview,
  };
}
