import { useMemo, useRef } from 'react';
import type { ContrastVariable } from '../../../../model/Template/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment } from '../../../../model/Theme/schema/theme-schemas';
import type { TokenizedPreview } from '../../../../model/Theme/preview-types';
import {
  previewLineFingerprint,
  resolvePreviewLine,
  type PreviewTokenTooltipContext,
  type ResolvedPreviewLine,
} from '../../../../domain/operations/Theme/theme-operations/theme-utils/resolve-editor-preview-lines-operation';
import type { ScopeColorMap } from '../../../../domain/operations/Theme/theme-operations/theme-utils/scope-resolver-operation';

/**
 * Stable cache version from store generations and resolved default foreground colors.
 */
function buildResolutionCacheVersion(params: {
  scopeThemeInputsGeneration: number;
  scopeTemplateInputsGeneration: number;
  editorPreviewsGeneration: number;
  defaultEditorFgDark: string;
  defaultEditorFgLight: string;
}): string {
  const {
    scopeThemeInputsGeneration,
    scopeTemplateInputsGeneration,
    editorPreviewsGeneration,
    defaultEditorFgDark,
    defaultEditorFgLight,
  } = params;
  return `${scopeThemeInputsGeneration}:${scopeTemplateInputsGeneration}:${editorPreviewsGeneration}:${defaultEditorFgDark}:${defaultEditorFgLight}`;
}

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
  scopeColorMap: ScopeColorMap;
  colorAssignments: readonly ColorAssignment[];
  contrastAssignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
  defaultEditorFgDark: string;
  defaultEditorFgLight: string;
  visibleIndices: readonly number[];
  scopeThemeInputsGeneration: number;
  scopeTemplateInputsGeneration: number;
  editorPreviewsGeneration: number;
}): {
  scopeColorMap: ScopeColorMap;
  scopeColorMapVersion: string;
  tooltipContext: PreviewTokenTooltipContext;
  getResolvedPreview: (index: number) => ResolvedPreview | undefined;
} {
  const {
    previews,
    scopeColorMap,
    colorAssignments,
    contrastAssignments,
    contrastVariables,
    defaultEditorFgDark,
    defaultEditorFgLight,
    visibleIndices,
    scopeThemeInputsGeneration,
    scopeTemplateInputsGeneration,
    editorPreviewsGeneration,
  } = params;

  const resolutionCacheVersion = useMemo(
    () =>
      buildResolutionCacheVersion({
        scopeThemeInputsGeneration,
        scopeTemplateInputsGeneration,
        editorPreviewsGeneration,
        defaultEditorFgDark,
        defaultEditorFgLight,
      }),
    [
      scopeThemeInputsGeneration,
      scopeTemplateInputsGeneration,
      editorPreviewsGeneration,
      defaultEditorFgDark,
      defaultEditorFgLight,
    ],
  );

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
    if (firstKey != null && !firstKey.endsWith(`:${resolutionCacheVersion}`)) {
      lineCacheRef.current.clear();
      previewCacheRef.current.clear();
    }
  }

  const getResolvedPreview = useMemo(() => {
    const lineCache = lineCacheRef.current;
    const previewCache = previewCacheRef.current;
    const version = resolutionCacheVersion;
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
    previews,
    scopeColorMap,
    resolutionCacheVersion,
    defaultEditorFgDark,
    defaultEditorFgLight,
  ]);

  return {
    scopeColorMap,
    scopeColorMapVersion: resolutionCacheVersion,
    tooltipContext,
    getResolvedPreview,
  };
}
