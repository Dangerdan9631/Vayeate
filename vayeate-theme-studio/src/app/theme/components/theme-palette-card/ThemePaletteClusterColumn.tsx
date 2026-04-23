import {
  useCallback,
  type KeyboardEvent,
  type MouseEvent,
  type MutableRefObject,
} from 'react';
import type { ClusterResult } from '../../../../domain/utils/color-clustering';
import { normalizeThemeHex } from '../../../../domain/utils/normalize-theme-hex';
import type { TriState } from '../../../common/components/TriStateCheckbox';

const PRIMARY_SINGLE_CLICK_DELAY_MS = 300;

function swatchState(refs: string[], checkedColorRefs: ReadonlySet<string>): TriState {
  if (refs.length === 0) return 'none';
  const all = refs.every((r) => checkedColorRefs.has(r));
  const none = refs.every((r) => !checkedColorRefs.has(r));
  if (all) return 'all';
  if (none) return 'none';
  return 'some';
}

function normalizeHexLocal(hex: string): string {
  const s = hex.trim().toLowerCase();
  return s.startsWith('#') ? s : `#${s}`;
}

export interface ThemePaletteClusterColumnProps {
  cluster: ClusterResult;
  groupKey: string;
  refsInGroupSet: ReadonlySet<string>;
  hexToRefs: Map<string, string[]>;
  checkedColorRefs: ReadonlySet<string>;
  onSetColorRefsChecked: (refs: string[], checked: boolean) => void;
  handleSwatchClick: (hex: string, refsInGroup: ReadonlySet<string>) => void;
  copyHexToClipboard: (hex: string) => void;
  primaryClickPendingRef: MutableRefObject<{
    timeoutId: ReturnType<typeof setTimeout>;
    clusterKey: string;
    stateAtFirstClick: TriState;
    allRefsInCluster: string[];
    primaryHex: string;
    refsInGroupSet: ReadonlySet<string>;
  } | null>;
}

export function ThemePaletteClusterColumn({
  cluster,
  groupKey,
  refsInGroupSet,
  hexToRefs,
  checkedColorRefs,
  onSetColorRefsChecked,
  handleSwatchClick,
  copyHexToClipboard,
  primaryClickPendingRef,
}: ThemePaletteClusterColumnProps) {
  const primaryRefsAll = hexToRefs.get(normalizeHexLocal(cluster.representative)) ?? [];
  const primaryRefs = primaryRefsAll.filter((r) => refsInGroupSet.has(r));
  const primaryState = swatchState(primaryRefs, checkedColorRefs);
  const allRefsInClusterSet = new Set(primaryRefs);
  for (const hex of cluster.members) {
    const refs = hexToRefs.get(normalizeHexLocal(hex)) ?? [];
    for (const r of refs) if (refsInGroupSet.has(r)) allRefsInClusterSet.add(r);
  }
  const allRefsInCluster = [...allRefsInClusterSet];
  const clusterKey = `${groupKey}|${normalizeThemeHex(cluster.representative)}`;
  const primaryBorderClass =
    primaryState === 'all'
      ? 'theme-palette-swatch-checked'
      : primaryState === 'some'
        ? 'theme-palette-swatch-partial'
        : 'theme-palette-swatch-unchecked';

  const handlePrimaryActivate = useCallback(() => {
    const stateAtFirstClick = primaryState;
    const pending = primaryClickPendingRef.current;
    if (pending && pending.clusterKey === clusterKey) {
      clearTimeout(pending.timeoutId);
      primaryClickPendingRef.current = null;
      const checked = stateAtFirstClick === 'none' ? false : true;
      onSetColorRefsChecked(pending.allRefsInCluster, checked);
      return;
    }
    if (pending) {
      clearTimeout(pending.timeoutId);
      primaryClickPendingRef.current = null;
    }
    const timeoutId = setTimeout(() => {
      if (primaryClickPendingRef.current?.clusterKey === clusterKey) {
        handleSwatchClick(cluster.representative, refsInGroupSet);
        primaryClickPendingRef.current = null;
      }
    }, PRIMARY_SINGLE_CLICK_DELAY_MS);
    primaryClickPendingRef.current = {
      timeoutId,
      clusterKey,
      stateAtFirstClick,
      allRefsInCluster,
      primaryHex: cluster.representative,
      refsInGroupSet,
    };
  }, [
    primaryState,
    clusterKey,
    cluster.representative,
    refsInGroupSet,
    allRefsInCluster,
    primaryClickPendingRef,
    onSetColorRefsChecked,
    handleSwatchClick,
  ]);

  const onPrimarySwatchClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      handlePrimaryActivate();
    },
    [handlePrimaryActivate],
  );

  const onPrimarySwatchContextMenu = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      copyHexToClipboard(cluster.representative);
    },
    [cluster.representative, copyHexToClipboard],
  );

  const onPrimarySwatchKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePrimaryActivate();
      }
    },
    [handlePrimaryActivate],
  );

  const onMemberSwatchClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const hex = e.currentTarget.dataset.memberHex;
      if (!hex) return;
      handleSwatchClick(hex, refsInGroupSet);
    },
    [handleSwatchClick, refsInGroupSet],
  );

  const onMemberSwatchContextMenu = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const hex = e.currentTarget.dataset.memberHex;
      if (!hex) return;
      copyHexToClipboard(hex);
    },
    [copyHexToClipboard],
  );

  const onMemberSwatchKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const hex = e.currentTarget.dataset.memberHex;
      if (!hex) return;
      handleSwatchClick(hex, refsInGroupSet);
    },
    [handleSwatchClick, refsInGroupSet],
  );

  return (
    <div className="theme-palette-cluster-column">
      <div
        role="button"
        tabIndex={0}
        className={`theme-palette-swatch theme-palette-swatch-primary ${primaryBorderClass}`}
        style={{ backgroundColor: cluster.representative }}
        title={
          primaryRefs.length > 0
            ? `${normalizeHexLocal(cluster.representative)} — click to toggle variables, double-click to select cluster, right-click to copy\n${primaryRefs.join('\n')}`
            : `${normalizeHexLocal(cluster.representative)} — click to toggle variables, double-click to select cluster, right-click to copy`
        }
        aria-label={`${normalizeHexLocal(cluster.representative)}, ${primaryState} selected. Click to toggle, double-click to select cluster, right-click to copy.`}
        onClick={onPrimarySwatchClick}
        onContextMenu={onPrimarySwatchContextMenu}
        onKeyDown={onPrimarySwatchKeyDown}
      />
      <div className="theme-palette-member-swatches">
        {cluster.members.map((hex, midx) => {
          const memberRefsAll = hexToRefs.get(normalizeHexLocal(hex)) ?? [];
          const memberRefs = memberRefsAll.filter((r) => refsInGroupSet.has(r));
          const memberState = swatchState(memberRefs, checkedColorRefs);
          const memberBorderClass =
            memberState === 'all'
              ? 'theme-palette-swatch-checked'
              : memberState === 'some'
                ? 'theme-palette-swatch-partial'
                : 'theme-palette-swatch-unchecked';

          return (
            <div
              key={midx}
              role="button"
              tabIndex={0}
              data-member-hex={hex}
              className={`theme-palette-swatch theme-palette-swatch-member ${memberBorderClass}`}
              style={{ backgroundColor: hex }}
              title={
                memberRefs.length > 0
                  ? `${normalizeHexLocal(hex)} — click to toggle variables, right-click to copy\n${memberRefs.join('\n')}`
                  : `${normalizeHexLocal(hex)} — click to toggle variables, right-click to copy`
              }
              aria-label={`${normalizeHexLocal(hex)}, ${memberState} selected. Click to toggle, right-click to copy.`}
              onClick={onMemberSwatchClick}
              onContextMenu={onMemberSwatchContextMenu}
              onKeyDown={onMemberSwatchKeyDown}
            />
          );
        })}
      </div>
    </div>
  );
}
