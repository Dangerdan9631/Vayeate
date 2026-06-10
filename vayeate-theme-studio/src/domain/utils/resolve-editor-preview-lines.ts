import type { ContrastVariable } from '../../model/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment } from '../../model/schema/theme-schemas';
import type { TokenizedPreviewLine } from '../../model/preview-types';
import { contrastRatio } from './color-wcag';
import type { ScopeColorMap, ScopeColorMapEntry } from './scope-resolver';
import { resolveTokenColor, resolveTokenEntry } from './scope-resolver';

export interface PreviewTokenTooltipContext {
  colorAssignments: readonly ColorAssignment[];
  contrastAssignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
}

export interface PreviewTokenTooltipData {
  scopeLabel: string;
  entry: ScopeColorMapEntry;
}

export interface ResolvedPreviewToken {
  text: string;
  darkColor: string;
  lightColor: string;
  /** Scope-only label when no mapping entry; otherwise contrast tooltip built on hover. */
  scopeLabel: string;
  tooltipData: PreviewTokenTooltipData | null;
}

export type ResolvedPreviewLine = { tokens: ResolvedPreviewToken[] };

function colorForRef(
  colorAssignments: readonly ColorAssignment[],
  ref: string | null,
  mode: 'dark' | 'light',
  fallback: string,
): string {
  if (!ref) return fallback;
  const a = colorAssignments.find((x) => x.colorRef === ref);
  if (!a) return fallback;
  if (mode === 'dark') return a.dark?.value ?? fallback;
  return a.useDarkForLight ? (a.dark?.value ?? fallback) : (a.light?.value ?? fallback);
}

function contrastParamsForRef(
  contrastAssignments: readonly ContrastAssignment[],
  contrastVariableRef: string,
  mode: 'dark' | 'light',
): { value: number; comparisonMethod: string; min: number | null; max: number | null } | null {
  const a = contrastAssignments.find((x) => x.contrastVariableRef === contrastVariableRef);
  if (!a) return null;
  const val = mode === 'dark' ? a.dark : a.useDarkForLight ? a.dark : a.light;
  if (!val) return null;
  return {
    value: val.value,
    comparisonMethod: val.comparisonMethod,
    min: val.min ?? null,
    max: val.max ?? null,
  };
}

export function buildPreviewTokenTooltipTitle(
  mode: 'dark' | 'light',
  data: PreviewTokenTooltipData,
  context: PreviewTokenTooltipContext,
): string {
  const { scopeLabel, entry } = data;
  const { colorAssignments, contrastAssignments, contrastVariables } = context;
  const lines: string[] = [
    scopeLabel,
    `Color variable: ${entry.colorVariableRef}`,
    `Contrast variable: ${entry.contrastVariableRef ?? '—'}`,
  ];
  const assigned = mode === 'dark' ? entry.assignedDark : entry.assignedLight;
  const resolved = mode === 'dark' ? entry.darkColor : entry.lightColor;
  if (entry.contrastVariableRef) {
    const cv = contrastVariables.find((v) => v.key === entry.contrastVariableRef);
    const comparisonSourceRef = cv?.comparisonSourceRef ?? null;
    const comparisonSourceColor = comparisonSourceRef
      ? colorForRef(colorAssignments, comparisonSourceRef, mode, '')
      : null;
    const sourceColorDisplay = comparisonSourceColor || '—';
    lines.push(`Comparison source: ${comparisonSourceRef ?? '—'} (${sourceColorDisplay})`);
    const params = contrastParamsForRef(contrastAssignments, entry.contrastVariableRef, mode);
    if (params) {
      const minMax = [params.min, params.max].filter((x) => x != null).length
        ? `, min: ${params.min ?? '—'}, max: ${params.max ?? '—'}`
        : '';
      lines.push(`Contrast params: value: ${params.value}, method: ${params.comparisonMethod}${minMax}`);
    }
    const hasMinMax = params && (params.min != null || params.max != null);
    const BLACK = '#000000';
    if (comparisonSourceColor) {
      const evaluated = assigned ? contrastRatio(assigned, comparisonSourceColor) : null;
      const resolvedRatio = resolved ? contrastRatio(resolved, comparisonSourceColor) : null;
      const evaluatedVsBlack = assigned ? contrastRatio(assigned, BLACK) : null;
      const resolvedVsBlack = resolved ? contrastRatio(resolved, BLACK) : null;
      const evalSuffix = hasMinMax && evaluatedVsBlack != null ? ` (vs black: ${evaluatedVsBlack.toFixed(2)})` : '';
      const resolvedSuffix = hasMinMax && resolvedVsBlack != null ? ` (vs black: ${resolvedVsBlack.toFixed(2)})` : '';
      lines.push(
        `Evaluated contrast: ${evaluated != null ? evaluated.toFixed(2) : '—'}${evalSuffix}`,
        `Resolved contrast: ${resolvedRatio != null ? resolvedRatio.toFixed(2) : '—'}${resolvedSuffix}`,
      );
    } else {
      lines.push('Evaluated contrast: —', 'Resolved contrast: —');
    }
  }
  lines.push(`Assigned: ${assigned ?? '—'}`, `Resolved: ${resolved ?? '—'}`);
  return lines.join('\n');
}

export function previewLineFingerprint(line: TokenizedPreviewLine): string {
  return line.tokens.map((token) => `${token.text}\0${token.scopes.join('\x1f')}`).join('\n');
}

export function resolvePreviewLine(
  line: TokenizedPreviewLine,
  scopeColorMap: ScopeColorMap,
  defaultEditorFgDark: string,
  defaultEditorFgLight: string,
): ResolvedPreviewLine {
  return {
    tokens: line.tokens.map((token) => {
      const entry = resolveTokenEntry(token.scopes, scopeColorMap);
      const scopeLabel = token.scopes.length > 0 ? token.scopes.join(' › ') : 'no scope';
      if (entry) {
        return {
          text: token.text,
          darkColor: entry.darkColor ?? defaultEditorFgDark,
          lightColor: entry.lightColor ?? defaultEditorFgLight,
          scopeLabel,
          tooltipData: { scopeLabel, entry },
        };
      }
      return {
        text: token.text,
        darkColor: resolveTokenColor(token.scopes, scopeColorMap, 'dark') ?? defaultEditorFgDark,
        lightColor: resolveTokenColor(token.scopes, scopeColorMap, 'light') ?? defaultEditorFgLight,
        scopeLabel,
        tooltipData: null,
      };
    }),
  };
}
