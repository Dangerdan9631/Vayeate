'use strict';
// generate-light-themes.js
// Generates (or regenerates) a paired light color theme for every dark theme in themes/.
//
// Light theme rules:
//   - Toolbar & menu colors (title bar, menu bar, activity bar, status bar,
//     notifications, extension buttons, badges) are IDENTICAL to the dark variant.
//   - Editor + panel backgrounds are a very light grey slightly shifted toward the
//     primary hue (derived from editorCursor.foreground), capped so that the
//     contrast between the light background and the adjacent dark chrome never
//     exceeds 10:1.
//   - Code-syntax token colors keep the same hue/saturation as the dark variant but
//     their lightness is adjusted so that each token meets its required contrast ratio
//     against the light editor background:
//       comments        → 1.5:1
//       keywords        → 5:1
//       strings         → 4:1
//       everything else → 3:1
//
// Run from the workspace root: node scripts/generate-light-themes.js

const fs   = require('fs');
const path = require('path');

// ─── WCAG 2.1 Helpers ────────────────────────────────────────────────────────

function hexToRgb(hex) {
    const h = hex.replace('#', '').slice(0, 6);
    return [
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255,
    ];
}

function toLinear(c) {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
    const [r, g, b] = hexToRgb(hex).map(toLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg, bg) {
    if (!fg || !bg) return 0;
    const l1 = luminance(fg.slice(0, 7));
    const l2 = luminance(bg.slice(0, 7));
    const lighter = Math.max(l1, l2);
    const darker  = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

// ─── HSL Helpers ─────────────────────────────────────────────────────────────

function rgbToHsl(r, g, b) {
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if      (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else                h = (r - g) / d + 4;
    return [h / 6, s, l];
}

function hslToRgb(h, s, l) {
    if (s === 0) return [l, l, l];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    function hue2rgb(t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }
    return [hue2rgb(h + 1 / 3), hue2rgb(h), hue2rgb(h - 1 / 3)];
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(c => Math.round(c * 255).toString(16).padStart(2, '0')).join('');
}

function fromHsl(h, s, l) {
    return rgbToHex(...hslToRgb(h, s, l));
}

function getHue(hex) {
    const [r, g, b] = hexToRgb(hex);
    const [h, s, l] = rgbToHsl(r, g, b);
    return { h, s, l };
}

// ─── Brightness Adjuster ──────────────────────────────────────────────────────

/**
 * Adjust lightness of hexFg so contrast ratio vs hexBg reaches 'target'.
 * mode='min' → only adjust if current < target (push toward more contrast).
 * mode='exact' → converge to exactly target.
 * Preserves hue and saturation; preserves any alpha suffix.
 */
function adjustBrightness(hexFg, hexBg, target, mode = 'min') {
    if (!hexFg || hexFg.length < 7 || !hexBg || hexBg.length < 7) return hexFg;

    const alpha   = hexFg.length === 9 ? hexFg.slice(7) : '';
    const fgBase  = hexFg.slice(0, 7);
    const bgBase  = hexBg.slice(0, 7);
    const current = contrastRatio(fgBase, bgBase);

    if (mode === 'min' && current >= target) return hexFg;

    const fgLum = luminance(fgBase);
    const bgLum = luminance(bgBase);

    // For light themes: fg is usually darker than bg → darken to increase contrast.
    // For dark themes: fg is lighter than bg → lighten to increase contrast.
    const fgShouldBeLighter = fgLum >= bgLum;
    const goLighter = mode === 'min'
        ? fgShouldBeLighter
        : current < target
            ? fgShouldBeLighter
            : !fgShouldBeLighter;

    const [r, g, b] = hexToRgb(fgBase);
    const [h, s, l] = rgbToHsl(r, g, b);

    let lo = goLighter ? l : 0;
    let hi = goLighter ? 1 : l;
    let best = fgBase;

    for (let i = 0; i < 64; i++) {
        const mid = (lo + hi) / 2;
        const [nr, ng, nb] = hslToRgb(h, s, mid);
        const candidate = rgbToHex(nr, ng, nb);
        const ratio = contrastRatio(candidate, bgBase);

        if (mode === 'min') {
            if (goLighter) {
                // Dark bg: brighter fg → more contrast. Find minimum L increase that hits target.
                if (ratio >= target) { best = candidate; hi = mid; } // achieved, try less bright
                else                 { lo = mid; }                    // not enough, go brighter
            } else {
                // Light bg: darker fg → more contrast. Find maximum L (least dark) that hits target.
                if (ratio >= target) { best = candidate; lo = mid; } // achieved, try lighter
                else                 { hi = mid; }                    // too light, go darker
            }
        } else {
            best = candidate;
            if (goLighter) {
                if (ratio < target) lo = mid; else hi = mid;
            } else {
                if (ratio > target) hi = mid; else lo = mid;
            }
        }
    }

    // Fallback: if target still not met (e.g. wrong initial direction chosen because fg ≈ bg
    // luminance), retry in the opposite direction and keep whichever result is better.
    if (mode === 'min' && contrastRatio(best, bgBase) < target) {
        const lo2 = goLighter ? 0 : l;
        const hi2 = goLighter ? l : 1;
        let lo3 = lo2, hi3 = hi2, best2 = fgBase;
        for (let i = 0; i < 64; i++) {
            const mid = (lo3 + hi3) / 2;
            const [nr, ng, nb] = hslToRgb(h, s, mid);
            const candidate = rgbToHex(nr, ng, nb);
            const ratio = contrastRatio(candidate, bgBase);
            if (!goLighter) {
                // Now going lighter to increase contrast
                if (ratio >= target) { best2 = candidate; hi3 = mid; }
                else                 { lo3 = mid; }
            } else {
                // Now going darker to increase contrast
                if (ratio >= target) { best2 = candidate; lo3 = mid; }
                else                 { hi3 = mid; }
            }
        }
        // Pick whichever achieved the target; prefer the result with smaller luminance change.
        const ratioA = contrastRatio(best, bgBase);
        const ratioB = contrastRatio(best2, bgBase);
        if (ratioB >= target && (ratioA < target || Math.abs(luminance(best2) - fgLum) < Math.abs(luminance(best) - fgLum))) {
            best = best2;
        }
    }

    return best + alpha;
}

// ─── Background Contrast Cap ────────────────────────────────────────────────

/**
 * Darken hexBg until its contrast ratio vs hexRef drops to at or below maxRatio.
 * Used to prevent light backgrounds from being so bright they clash with the
 * adjacent dark chrome (tab bar, gutter, panel).
 */
function capBgBrightness(hexBg, hexRef, maxRatio) {
    if (!hexBg || !hexRef || hexBg.length < 7 || hexRef.length < 7) return hexBg;
    if (contrastRatio(hexBg.slice(0, 7), hexRef.slice(0, 7)) <= maxRatio) return hexBg;

    const [r, g, b] = hexToRgb(hexBg.slice(0, 7));
    const [h, s, l] = rgbToHsl(r, g, b);

    // Binary search: find the highest lightness where contrast ≤ maxRatio.
    let lo = 0, hi = l, best = fromHsl(h, s, 0);
    for (let i = 0; i < 64; i++) {
        const mid = (lo + hi) / 2;
        const candidate = fromHsl(h, s, mid);
        if (contrastRatio(candidate, hexRef.slice(0, 7)) <= maxRatio) {
            best = candidate;
            lo = mid; // achieved — try lighter
        } else {
            hi = mid; // still too bright — go darker
        }
    }
    return best;
}

// ─── Scope / Token Target Detection ─────────────────────────────────────────

function isCommentScope(s) {
    return s === 'comment' || s.startsWith('comment.') ||
           s === 'punctuation.definition.comment' || s.startsWith('punctuation.definition.comment.');
}
function isKeywordScope(s) {
    const segs = s.split(/\s+/);
    return segs.some(seg =>
        seg === 'keyword' || seg.startsWith('keyword.') ||
        seg === 'storage' || seg.startsWith('storage.')
    );
}
function isStringScope(s) {
    const segs = s.split(/\s+/);
    return segs.some(seg =>
        seg === 'string' || seg.startsWith('string.') ||
        seg === 'punctuation.definition.string' || seg.startsWith('punctuation.definition.string.')
    );
}

function tokenTarget(entry) {
    const scopes = Array.isArray(entry.scope) ? entry.scope : [entry.scope || ''];
    if (scopes.some(isCommentScope)) return 1.5;
    if (scopes.some(isKeywordScope)) return 5.0;
    if (scopes.some(isStringScope))  return 4.0;
    return 3.0;
}

function semanticTarget(key) {
    const base = key.split('.')[0];
    if (base === 'comment')                                          return 1.5;
    if (['keyword','controlKeyword','plainKeyword','modifier','storageType'].includes(base)) return 5.0;
    if (['string','stringEscapeCharacter','regexp'].includes(base))  return 4.0;
    return 3.0;
}

// ─── JSONC Parser ─────────────────────────────────────────────────────────────

function stripJsoncComments(src) {
    let result = '';
    let i = 0;
    while (i < src.length) {
        if (src[i] === '"') {
            let j = i + 1;
            while (j < src.length) {
                if (src[j] === '\\') { j += 2; continue; }
                if (src[j] === '"')  { j++; break; }
                j++;
            }
            result += src.slice(i, j);
            i = j;
            continue;
        }
        if (src[i] === '/' && src[i + 1] === '/') {
            while (i < src.length && src[i] !== '\n') i++;
            continue;
        }
        if (src[i] === '/' && src[i + 1] === '*') {
            i += 2;
            while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
            i += 2;
            continue;
        }
        result += src[i++];
    }
    return result;
}

function parseJsonc(src) {
    const clean = stripJsoncComments(src).replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(clean);
}

// ─── Color Key Categories ────────────────────────────────────────────────────

// These keys are copied verbatim from the dark theme (toolbar + menu).
const COPY_FROM_DARK = new Set([
    // Title Bar
    'titleBar.activeBackground', 'titleBar.activeForeground', 'titleBar.border',
    'titleBar.inactiveBackground', 'titleBar.inactiveForeground',
    // Focus border (toolbar accent)
    'focusBorder',
    // Menu Bar
    'menu.background', 'menu.foreground', 'menu.separatorBackground',
    'menu.selectionForeground', 'menu.selectionBackground',
    'menubar.selectionForeground', 'menubar.selectionBackground',
    // Activity Bar (always dark)
    'activityBar.foreground', 'activityBar.background', 'activityBar.activeBorder',
    'activityBar.dropBorder', 'activityBar.inactiveForeground',
    // Status Bar
    'statusBar.background', 'statusBar.foreground',
    'statusBar.debuggingBackground', 'statusBar.debuggingForeground',
    'statusBarItem.remoteForeground',
    'statusBar.noFolderBackground', 'statusBar.noFolderForeground',
    'statusBarItem.activeBackground', 'statusBarItem.errorBackground',
    'statusBarItem.errorForeground', 'statusBarItem.hoverBackground',
    'progressBar.background',
    // Notifications
    'notifications.foreground', 'notifications.background', 'notifications.border',
    'notificationToast.border',
    'notificationCenterHeader.foreground', 'notificationCenterHeader.background',
    'notificationCenter.border',
    'notificationsInfoIcon.foreground', 'notificationsWarningIcon.foreground',
    'notificationsErrorIcon.foreground', 'notificationLink.foreground',
    // Extension Pane
    'extensionButton.prominentBackground', 'extensionButton.prominentForeground',
    'extensionButton.prominentHoverBackground',
    // Badges (on dark activity bar)
    'activityBarBadge.foreground', 'activityBarBadge.background',
    'badge.foreground', 'badge.background',
    'extensionBadge.remoteForeground', 'extensionBadge.remoteBackground',
    // Gutter (matches ribbon chrome)
    'editorGutter.background', 'editorGutter.addedBackground',
    'editorGutter.deletedBackground', 'editorGutter.modifiedBackground',
    // Editor tab bar (matches ribbon chrome)
    'editorGroupHeader.tabsBackground',
    // Tabs (match ribbon chrome)
    'tab.activeBackground', 'tab.activeForeground', 'tab.border',
    'tab.inactiveBackground', 'tab.inactiveForeground',
    // Bottom Panel (matches ribbon chrome)
    'panel.border', 'panelTitle.activeForeground', 'panelTitle.activeBorder',
    'panelTitle.inactiveForeground', 'panel.background', 'panel.dropBorder',
    'panelSection.border', 'panelSection.dropBackground', 'panelSectionHeader.background',
    // Side bar section headers (match ribbon chrome; applies to left and right sidebars)
    'sideBarSectionHeader.background', 'sideBarSectionHeader.foreground',
    // Gutter line numbers (gutter background is dark, so numbers must be light)
    'editorLineNumber.foreground', 'editorLineNumber.activeForeground',
    // Breadcrumb (matches tab bar / ribbon chrome)
    'breadcrumb.foreground', 'breadcrumb.background', 'breadcrumb.focusForeground',
    'breadcrumb.activeSelectionForeground', 'breadcrumbPicker.background',
    // Terminal (identical to dark theme)
    'terminal.ansiBlack', 'terminal.ansiBlue', 'terminal.ansiBrightBlack',
    'terminal.ansiBrightBlue', 'terminal.ansiBrightCyan', 'terminal.ansiBrightGreen',
    'terminal.ansiBrightMagenta', 'terminal.ansiBrightRed', 'terminal.ansiBrightWhite',
    'terminal.ansiBrightYellow', 'terminal.ansiCyan', 'terminal.ansiGreen',
    'terminal.ansiMagenta', 'terminal.ansiRed', 'terminal.ansiWhite', 'terminal.ansiYellow',
    'terminal.border', 'terminal.foreground', 'terminal.background',
]);

// ─── Light Theme Generator ───────────────────────────────────────────────────

function generateLightTheme(dark) {
    const dc = dark.colors;

    // ── Primary hue ──────────────────────────────────────────────────────────
    // Use editorCursor.foreground as primary hue source.  If its saturation is
    // very low (≤ 0.08), fall back to the activityBar.foreground.
    let primaryHex = dc['editorCursor.foreground'] || dc['activityBar.foreground'] || '#888888';
    let { h: pH, s: pS } = getHue(primaryHex);
    if (pS <= 0.08) {
        const fallback = dc['activityBar.foreground'] || dc['activityBar.activeBorder'] || primaryHex;
        const fb = getHue(fallback);
        if (fb.s > pS) { pH = fb.h; pS = fb.s; }
    }

    // ── Light background palette ──────────────────────────────────────────────
    // Dark chrome reference: the adjacent tab bar / gutter / panel background
    // from the dark theme, used to cap the contrast between light and dark areas.
    const darkChromeRef = dc['editorGroupHeader.tabsBackground'] || dc['panel.background'] || '#1e1e1e';
    const MAX_BG_CONTRAST = 10.0;

    const editorBg    = capBgBrightness(fromHsl(pH, 0.06, 0.965), darkChromeRef, MAX_BG_CONTRAST);
    // Line highlight uses a semi-transparent mid-tone so it reads as a visible
    // shift on both the dark gutter and the light editor without clashing with either.
    const lineHlBg    = fromHsl(pH, 0.08, 0.62) + '44';
    const selBg       = fromHsl(pH, 0.22, 0.840); // selection
    const panelBg     = capBgBrightness(fromHsl(pH, 0.05, 0.920), darkChromeRef, MAX_BG_CONTRAST);
    const sectionBg   = fromHsl(pH, 0.06, 0.880); // section headers / inactive tabs
    const borderColor = fromHsl(pH, 0.07, 0.780); // borders / rulers
    const scrollBase  = fromHsl(pH, 0.06, 0.650); // scrollbar base

    // Input background: midpoint lightness between the light sidebar and the dark chrome,
    // so inputs look neutral in both contexts.
    const [plr, plg, plb] = hexToRgb(panelBg);
    const [,,  panelL] = rgbToHsl(plr, plg, plb);
    const [dcr, dcg, dcb] = hexToRgb(darkChromeRef.slice(0, 7));
    const [,,  darkL ] = rgbToHsl(dcr, dcg, dcb);
    const inputBg = fromHsl(pH, 0.06, (panelL + darkL) / 2);

    // ── Foreground helpers ───────────────────────────────────────────────────
    // adj(hex, bg, ratio): darken hex until it reaches the target contrast vs bg.
    function adj(hex, bg, ratio = 4.5) {
        if (!hex || hex.length < 7) return hex;
        return adjustBrightness(hex, bg, ratio, 'min');
    }

    // ── Build colors object ───────────────────────────────────────────────────
    const lc = {};

    // ── Copy toolbar / menu from dark verbatim ─────────────────────────────
    for (const key of COPY_FROM_DARK) {
        if (dc[key] !== undefined) lc[key] = dc[key];
    }

    // Global foreground: used as fallback in unthemed areas, notably the dark panel
    // content (Problems, Output, etc.). Computed from the dark chrome so text is
    // readable on the dark panel background. Light areas (editor, sidebar) override
    // this with their own explicit foreground keys.
    lc['foreground'] = adjustBrightness(
        dc['editor.foreground'] || dc['panelTitle.activeForeground'] || '#cccccc',
        darkChromeRef, 4.5, 'min'
    );

    // ── Breadcrumb ──────── (copied verbatim from dark via COPY_FROM_DARK) ──────────────

    // ── Side Bar ──────────────────────────────────────────────────────────────
    lc['sideBar.background']                   = panelBg;
    lc['sideBar.foreground']                   = adj(dc['sideBar.foreground'],                    panelBg, 4.5);
    // sideBarSectionHeader copied verbatim from dark via COPY_FROM_DARK
    lc['sideBarTitle.foreground']              = adj(dc['sideBarTitle.foreground'],               panelBg, 4.5);
    lc['sideBar.dropBackground']               = selBg + '99';
    lc['sideBar.border']                       = borderColor;

    // ── Editor View ───────────────────────────────────────────────────────────
    lc['editor.foreground']                    = adj(dc['editor.foreground'],                     editorBg, 4.5);
    lc['editor.background']                    = editorBg;
    lc['editorCursor.foreground']              = dc['editorCursor.foreground'];
    lc['editor.lineHighlightBackground']       = lineHlBg;
    lc['editor.selectionBackground']           = selBg + '99';
    // editorLineNumber keys copied verbatim from dark via COPY_FROM_DARK (gutter bg is dark)
    lc['editorIndentGuide.background']         = fromHsl(pH, 0.06, 0.840);
    lc['editorIndentGuide.activeBackground']   = fromHsl(pH, 0.08, 0.680);
    lc['editorInlayHint.foreground']           = adj(dc['editorInlayHint.foreground'],           panelBg, 4.5);
    lc['editorInlayHint.background']           = panelBg;

    // ── Gutter ──────────── (copied verbatim from dark via COPY_FROM_DARK) ───────────────

    // ── Editor matching ───────────────────────────────────────────────────────
    lc['editor.findMatchBackground']           = selBg;
    lc['editor.findMatchHighlightBackground']  = selBg + '66';
    lc['editor.findRangeHighlightBackground']  = selBg + '22';
    lc['editorLink.activeForeground']          = adj(dc['editorLink.activeForeground'],          editorBg, 4.5);
    lc['editorCodeLens.foreground']            = adj(dc['editorCodeLens.foreground']
        ? dc['editorCodeLens.foreground'].slice(0, 7)
        : fromHsl(pH, 0.06, 0.55), editorBg, 3.0) + '66';
    lc['editorBracketMatch.background']        = selBg + '55';
    lc['editorBracketMatch.border']            = borderColor + '66';
    lc['editorRuler.foreground']               = borderColor;

    // ── Editor Group ──────── (tabsBackground copied from dark via COPY_FROM_DARK) ────────
    lc['editorGroup.emptyBackground']          = editorBg;

    // ── Git Decorations ───────────────────────────────────────────────────────
    lc['gitDecoration.conflictingResourceForeground'] = adj(dc['gitDecoration.conflictingResourceForeground'], panelBg, 4.5);
    lc['gitDecoration.deletedResourceForeground']     = adj(dc['gitDecoration.deletedResourceForeground'],     panelBg, 4.5);
    lc['gitDecoration.ignoredResourceForeground']     = adj(dc['gitDecoration.ignoredResourceForeground'],     panelBg, 4.5);
    lc['gitDecoration.modifiedResourceForeground']    = adj(dc['gitDecoration.modifiedResourceForeground'],    panelBg, 4.5);
    lc['gitDecoration.untrackedResourceForeground']   = adj(dc['gitDecoration.untrackedResourceForeground'],   panelBg, 4.5);
    lc['diffEditor.insertedTextBackground']    = adj(dc['diffEditor.insertedTextBackground']
        ? dc['diffEditor.insertedTextBackground'].slice(0, 7)
        : fromHsl(pH, 0.15, 0.70), editorBg, 1.5) + '33';
    lc['diffEditor.removedTextBackground']     = adj(dc['diffEditor.removedTextBackground']
        ? dc['diffEditor.removedTextBackground'].slice(0, 7)
        : fromHsl(pH, 0.15, 0.50), editorBg, 1.5) + '33';

    // ── Terminal ──────────── (copied verbatim from dark via COPY_FROM_DARK) ─────────────

    // textPreformat
    lc['textPreformat.foreground'] = adj(dc['textPreformat.foreground'] || dc['editor.foreground'], editorBg, 4.5);

    // ── Widgets ───────────────────────────────────────────────────────────────
    lc['editorWidget.foreground'] = adj(dc['editorWidget.foreground'], panelBg, 4.5);
    lc['editorWidget.background'] = panelBg;
    lc['editorWidget.border']     = borderColor;
    lc['widget.shadow']           = fromHsl(pH, 0.06, 0.60) + '66';

    // ── Panels ──────────── (copied verbatim from dark via COPY_FROM_DARK) ──────────────
    // panelSectionHeader.background is dark (from dark theme) but has no dark-theme
    // foreground — set one explicitly so it doesn't fall back to the light editor.foreground.
    lc['panelSectionHeader.foreground'] = dc['panelTitle.activeForeground'] || dc['panel.foreground'];

    // ── Lists ──────────────────────────────────────────────────────────────────
    lc['list.activeSelectionBackground']  = selBg + 'cc';
    lc['list.activeSelectionForeground']  = adj(dc['list.activeSelectionForeground'],  selBg, 4.5);
    lc['list.focusBackground']            = selBg + 'cc';
    lc['list.focusForeground']            = adj(dc['list.focusForeground'],            selBg, 4.5);
    lc['list.highlightForeground']        = adj(dc['list.highlightForeground'],        panelBg, 4.5);
    lc['list.hoverBackground']            = selBg + 'cc';
    lc['list.hoverForeground']            = adj(dc['list.hoverForeground'],            selBg, 4.5);
    lc['list.inactiveSelectionBackground']= selBg + 'aa';
    lc['list.inactiveSelectionForeground']= adj(dc['list.inactiveSelectionForeground'],selBg, 4.5);
    lc['list.invalidItemForeground']      = adj(dc['list.invalidItemForeground'],      panelBg, 4.5);

    // ── Buttons ───────────────────────────────────────────────────────────────
    lc['button.background']             = sectionBg;
    lc['button.foreground']             = adj(dc['button.foreground'],          sectionBg, 4.5);
    lc['button.hoverBackground']        = fromHsl(pH, 0.06, 0.855);
    lc['button.secondaryBackground']    = panelBg;
    lc['button.secondaryForeground']    = adj(dc['button.secondaryForeground'], panelBg, 4.5);
    lc['button.secondaryHoverBackground'] = fromHsl(pH, 0.05, 0.900);

    // ── Dropdowns ──────────────────────────────────────────────────────────────
    lc['dropdown.background']     = editorBg;
    lc['dropdown.border']         = borderColor;
    lc['dropdown.foreground']     = adj(dc['dropdown.foreground'],  editorBg, 4.5);
    lc['dropdown.listBackground'] = panelBg;

    // ── Scroll Bars ────────────────────────────────────────────────────────────
    lc['scrollbar.shadow']                   = fromHsl(pH, 0.06, 0.50) + '66';
    lc['scrollbarSlider.activeBackground']   = scrollBase + '66';
    lc['scrollbarSlider.background']         = scrollBase + '33';
    lc['scrollbarSlider.hoverBackground']    = scrollBase + '55';

    // ── Input Boxes ────────────────────────────────────────────────────────────
    lc['input.background']              = inputBg;
    lc['input.border']                  = borderColor;
    // inputBg is a medium-grey midpoint — the maximum achievable contrast from the light
    // direction is ~3.5:1, so forcing 4.5 would always fall back to dark text.
    // Instead explicitly derive a light foreground from the near-white end: this guarantees
    // a light colour that is as readable as the background allows while matching each
    // theme's primary hue.
    lc['input.foreground']              = fromHsl(pH, 0.05, 0.93);
    lc['input.placeholderForeground']   = fromHsl(pH, 0.04, 0.68);
    lc['inputOption.activeForeground']  = fromHsl(pH, 0.05, 0.93);
    lc['inputOption.activeBorder']      = dc['editorCursor.foreground'] || borderColor;
    // Keep validation backgrounds/foregrounds from dark (they carry semantic meaning).
    lc['inputValidation.errorBackground']   = dc['inputValidation.errorBackground'];
    lc['inputValidation.errorForeground']   = dc['inputValidation.errorForeground'];
    lc['inputValidation.infoBackground']    = dc['inputValidation.infoBackground'];
    lc['inputValidation.infoForeground']    = dc['inputValidation.infoForeground'];
    lc['inputValidation.warningBackground'] = dc['inputValidation.warningBackground'];
    lc['inputValidation.warningForeground'] = dc['inputValidation.warningForeground'];

    // ── Tabs ────────────── (copied verbatim from dark via COPY_FROM_DARK) ─────────────

    // ── Token Colors ──────────────────────────────────────────────────────────
    const tokenColors = (dark.tokenColors || []).map(entry => {
        if (!entry.settings || !entry.settings.foreground) return entry;
        const target = tokenTarget(entry);
        const newFg  = adjustBrightness(entry.settings.foreground, editorBg, target, 'min');
        return { ...entry, settings: { ...entry.settings, foreground: newFg } };
    });

    // ── Semantic Token Colors ─────────────────────────────────────────────────
    const semanticTokenColors = {};
    for (const [key, val] of Object.entries(dark.semanticTokenColors || {})) {
        const target = semanticTarget(key);
        if (typeof val === 'string') {
            semanticTokenColors[key] = adjustBrightness(val, editorBg, target, 'min');
        } else if (val && typeof val === 'object' && val.foreground) {
            semanticTokenColors[key] = { ...val, foreground: adjustBrightness(val.foreground, editorBg, target, 'min') };
        } else {
            semanticTokenColors[key] = val; // e.g. { strikethrough: true }
        }
    }

    return {
        name: dark.name + ' Light',
        type: 'light',
        semanticHighlighting: true,
        colors: lc,
        tokenColors,
        semanticTokenColors,
    };
}

// ─── Serializer ───────────────────────────────────────────────────────────────

function serialize(theme) {
    return JSON.stringify(theme, null, 4);
}

// ─── Light file name helper ───────────────────────────────────────────────────

function lightFileName(darkFile) {
    return darkFile.replace('-color-theme.json', '-light-color-theme.json');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const THEMES_DIR = path.join(__dirname, '..', 'themes');
const files = fs.readdirSync(THEMES_DIR).filter(f => f.endsWith('.json'));

let generated = 0;

for (const file of files) {
    if (file.includes('-light-')) continue; // skip existing light themes

    const filePath = path.join(THEMES_DIR, file);
    let dark;
    try {
        dark = parseJsonc(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.error(`[SKIP] ${file}: ${e.message}`);
        continue;
    }

    if (dark.type !== 'dark') continue;

    const lightTheme = generateLightTheme(dark);
    const outFile    = lightFileName(file);
    const outPath    = path.join(THEMES_DIR, outFile);

    fs.writeFileSync(outPath, serialize(lightTheme), 'utf8');
    console.log(`[OK] ${file}  →  ${outFile}`);
    generated++;
}

console.log(`\nDone. ${generated} light theme(s) generated.`);
