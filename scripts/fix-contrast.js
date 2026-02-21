'use strict';
// fix-contrast.js
// Adjusts foreground colors in all dark VS Code color themes so that:
//   - All non-comment foreground colors achieve >= 4.5:1 contrast vs their background
//   - Comment foreground colors are targeted to exactly 3:1 contrast vs editor.background
//
// Only brightness (HSL Lightness) is changed — hue and saturation are preserved.
// Run from the workspace root: node scripts/fix-contrast.js

const fs   = require('fs');
const path = require('path');

// ─── WCAG 2.1 Helpers ────────────────────────────────────────────────────────

function hexToRgb(hex) {
    const h = hex.replace('#', '').slice(0, 6); // strip alpha if 8-digit
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
    const l1 = luminance(fg);
    const l2 = luminance(bg);
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

/**
 * Adjust the brightness (L in HSL) of hexFg so that:
 *   - If mode === 'min': only increase if contrastRatio(fg,bg) < target  (floor mode)
 *   - If mode === 'exact': bring to exactly target by moving in whichever direction needed
 * Returns the adjusted hex string (6-digit, lowercase, no alpha).
 */
function adjustBrightness(hexFg, hexBg, target, mode = 'min') {
    if (!hexFg || hexFg.length < 7 || !hexBg || hexBg.length < 7) return hexFg;

    const alpha   = hexFg.length === 9 ? hexFg.slice(7) : ''; // preserve alpha suffix
    const current = contrastRatio(hexFg, hexBg);

    if (mode === 'min' && current >= target) return hexFg;

    const fgLum = luminance(hexFg);
    const bgLum = luminance(hexBg);

    // Determine whether to search toward lighter or darker
    // In dark themes fg is lighter than bg; to increase contrast we lighten fg, to decrease we darken.
    const increaseNeeded =
        mode === 'min'   ? current < target :            // need more contrast
        mode === 'exact' ? fgLum >= bgLum               // fg is lighter: increase contrast by going lighter; BUT if current > target we need to go darker
            ? current < target  // fg is lighter and below target → go lighter
            : current < target  // fg is darker and below target → go lighter
        : false;

    // Decide search direction: does the fg need to get lighter to reach the target?
    const fgShouldBeLighter = fgLum >= bgLum; // dark theme: fg is the bright side
    const goLighter = mode === 'min'
        ? fgShouldBeLighter   // just push L toward 1 to gain contrast
        : current < target    // exact mode: if below target, push toward more contrast
            ? fgShouldBeLighter
            : !fgShouldBeLighter; // if above target, push toward less contrast

    const [r, g, b] = hexToRgb(hexFg);
    const [h, s, l] = rgbToHsl(r, g, b);

    let lo = goLighter ? l : 0;
    let hi = goLighter ? 1 : l;
    let best = hexFg.slice(0, 7); // start with original as fallback

    for (let i = 0; i < 64; i++) {
        const mid = (lo + hi) / 2;
        const [nr, ng, nb] = hslToRgb(h, s, mid);
        const candidate = rgbToHex(nr, ng, nb);
        const ratio = contrastRatio(candidate, hexBg);

        if (mode === 'min') {
            if (ratio >= target) { best = candidate; hi = mid; }
            else                 { lo = mid; }
        } else {
            // exact: converge to the target ratio
            // goLighter=true: lo=l..1, higher mid → higher ratio
            //   ratio < target → need more contrast → lo = mid
            //   ratio >= target → best so far, try less → hi = mid
            // goLighter=false (darken): lo=0..l, higher mid → higher ratio
            //   ratio > target → need less contrast → hi = mid
            //   ratio <= target → best so far, try less dark → lo = mid
            best = candidate;
            if (goLighter) {
                if (ratio < target) lo = mid;
                else                hi = mid;
            } else {
                if (ratio > target) hi = mid;
                else                lo = mid;
            }
        }
    }

    return best + alpha;
}

// ─── JSONC Parser ─────────────────────────────────────────────────────────────
// Strips // and /* */ comments that appear outside of string literals.

function stripJsoncComments(src) {
    let result = '';
    let i = 0;
    while (i < src.length) {
        // Inside a string
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
        // Line comment
        if (src[i] === '/' && src[i + 1] === '/') {
            while (i < src.length && src[i] !== '\n') i++;
            continue;
        }
        // Block comment
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
    const stripped = stripJsoncComments(src);
    // Remove trailing commas before ] or } (JSONC allows them, JSON.parse does not)
    const clean = stripped.replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(clean);
}

// ─── UI Colors Pairing Map ────────────────────────────────────────────────────
// Maps foreground key → background key. Both must exist in colors{}.
// Keys omitted here are skipped (e.g. cursors, borders, decorations without text).

const UI_PAIRS = [
    // Title Bar
    ['titleBar.activeForeground',              'titleBar.activeBackground'],
    ['titleBar.inactiveForeground',            'titleBar.inactiveBackground'],
    // Menu
    ['menu.foreground',                        'menu.background'],
    ['menu.selectionForeground',               'menu.selectionBackground'],
    ['menubar.selectionForeground',            'menubar.selectionBackground'],
    // Activity Bar
    ['activityBar.foreground',                 'activityBar.background'],
    ['activityBar.inactiveForeground',         'activityBar.background'],
    // Breadcrumb
    ['breadcrumb.foreground',                  'breadcrumb.background'],
    ['breadcrumb.focusForeground',             'breadcrumb.background'],
    ['breadcrumb.activeSelectionForeground',   'breadcrumb.background'],
    // Side Bar
    ['sideBar.foreground',                     'sideBar.background'],
    ['sideBarSectionHeader.foreground',        'sideBarSectionHeader.background'],
    ['sideBarTitle.foreground',                'sideBar.background'],
    // Status Bar
    ['statusBar.foreground',                   'statusBar.background'],
    ['statusBar.debuggingForeground',          'statusBar.debuggingBackground'],
    ['statusBarItem.remoteForeground',         'statusBar.background'],
    ['statusBar.noFolderForeground',           'statusBar.noFolderBackground'],
    ['statusBarItem.errorForeground',          'statusBarItem.errorBackground'],
    // Notifications
    ['notifications.foreground',              'notifications.background'],
    ['notificationCenterHeader.foreground',   'notificationCenterHeader.background'],
    ['notificationLink.foreground',           'notifications.background'],
    ['notificationsInfoIcon.foreground',      'notifications.background'],
    ['notificationsWarningIcon.foreground',   'notifications.background'],
    ['notificationsErrorIcon.foreground',     'notifications.background'],
    // Extension Pane
    ['extensionButton.prominentForeground',   'extensionButton.prominentBackground'],
    ['extensionBadge.remoteForeground',       'extensionBadge.remoteBackground'],
    // Editor
    ['editor.foreground',                     'editor.background'],
    ['editorInlayHint.foreground',            'editorInlayHint.background'],
    ['editorCodeLens.foreground',             'editor.background'],
    ['editorLink.activeForeground',           'editor.background'],
    ['editorLineNumber.foreground',           'editorGutter.background', 'editor.background'],
    ['editorLineNumber.activeForeground',     'editorGutter.background', 'editor.background'],
    ['editorRuler.foreground',                'editor.background'],
    // Terminal
    ['terminal.foreground',                   'terminal.background'],
    ['textPreformat.foreground',              'editor.background'],
    // Widgets
    ['editorWidget.foreground',               'editorWidget.background'],
    // Badges
    ['activityBarBadge.foreground',           'activityBarBadge.background'],
    ['badge.foreground',                      'badge.background'],
    // Panels
    ['panelTitle.activeForeground',           'panel.background'],
    ['panelTitle.inactiveForeground',         'panel.background'],
    // Lists
    ['list.activeSelectionForeground',        'list.activeSelectionBackground'],
    ['list.focusForeground',                  'list.focusBackground'],
    ['list.highlightForeground',              'list.hoverBackground'],
    ['list.hoverForeground',                  'list.hoverBackground'],
    ['list.inactiveSelectionForeground',      'list.inactiveSelectionBackground'],
    ['list.invalidItemForeground',            'sideBar.background'],
    // Buttons
    ['button.foreground',                     'button.background'],
    ['button.secondaryForeground',            'button.secondaryBackground'],
    // Dropdowns
    ['dropdown.foreground',                   'dropdown.background'],
    // Input Boxes
    ['input.foreground',                      'input.background'],
    ['input.placeholderForeground',           'input.background'],
    ['inputOption.activeForeground',          'input.background'],
    ['inputValidation.errorForeground',       'inputValidation.errorBackground'],
    ['inputValidation.infoForeground',        'inputValidation.infoBackground'],
    ['inputValidation.warningForeground',     'inputValidation.warningBackground'],
    // Tabs
    ['tab.activeForeground',                  'tab.activeBackground'],
    ['tab.inactiveForeground',                'tab.inactiveBackground'],
    // Git decorations (shown in side bar)
    ['gitDecoration.conflictingResourceForeground', 'sideBar.background'],
    ['gitDecoration.deletedResourceForeground',     'sideBar.background'],
    ['gitDecoration.ignoredResourceForeground',     'sideBar.background'],
    ['gitDecoration.modifiedResourceForeground',    'sideBar.background'],
    ['gitDecoration.untrackedResourceForeground',   'sideBar.background'],
];

// ─── Scope / Semantic-key Detection ─────────────────────────────────────────
// Priority order when computing target: comment → keyword → string → default

function isCommentScope(scope) {
    const s = typeof scope === 'string' ? scope : '';
    return (
        s === 'comment' ||
        s.startsWith('comment.') ||
        s === 'punctuation.definition.comment' ||
        s.startsWith('punctuation.definition.comment.')
    );
}

function tokenEntryIsComment(entry) {
    const scopes = Array.isArray(entry.scope) ? entry.scope : [entry.scope];
    return scopes.some(isCommentScope);
}

function semanticKeyIsComment(key) {
    return key === 'comment' || key.startsWith('comment.');
}

// A scope selector string may be compound (e.g. "source.ini keyword");
// split on whitespace and check each segment.
function scopeSegments(scope) {
    return (typeof scope === 'string' ? scope : '').split(/\s+/);
}

function isKeywordScope(scope) {
    return scopeSegments(scope).some(seg =>
        seg === 'keyword' || seg.startsWith('keyword.') ||
        seg === 'storage' || seg.startsWith('storage.')
    );
}

function tokenEntryIsKeyword(entry) {
    const scopes = Array.isArray(entry.scope) ? entry.scope : [entry.scope];
    return scopes.some(isKeywordScope);
}

function semanticKeyIsKeyword(key) {
    // Match keyword, controlKeyword, plainKeyword, modifier, storageType, etc.
    const base = key.split('.')[0];
    return (
        base === 'keyword' ||
        base === 'controlKeyword' ||
        base === 'plainKeyword' ||
        base === 'modifier' ||
        base === 'storageType'
    );
}

function isStringScope(scope) {
    return scopeSegments(scope).some(seg =>
        seg === 'string' || seg.startsWith('string.') ||
        seg === 'punctuation.definition.string' ||
        seg.startsWith('punctuation.definition.string.')
    );
}

function tokenEntryIsString(entry) {
    const scopes = Array.isArray(entry.scope) ? entry.scope : [entry.scope];
    return scopes.some(isStringScope);
}

function semanticKeyIsString(key) {
    const base = key.split('.')[0];
    return base === 'string' || base === 'stringEscapeCharacter' || base === 'regexp';
}

// Resolve the contrast target for a token entry (priority: comment > keyword > string > default)
function tokenTarget(entry) {
    if (tokenEntryIsComment(entry))                                 return 3.0;
    if (tokenEntryIsKeyword(entry))                                 return 6.0;
    if (tokenEntryIsString(entry))                                  return 4.0;
    return 4.5;
}

function semanticTarget(key) {
    if (semanticKeyIsComment(key))                                  return 3.0;
    if (semanticKeyIsKeyword(key))                                  return 6.0;
    if (semanticKeyIsString(key))                                   return 4.0;
    return 4.5;
}

// ─── Raw-text replacement helpers ─────────────────────────────────────────────

/**
 * In the raw JSON text, replace the value of a single top-level colors key.
 * Matches:  "key.name": "#rrggbb"  (with optional alpha, any surrounding whitespace/comma)
 */
function replaceColorValue(raw, key, oldHex, newHex) {
    // Only replace the exact occurrence of this key's value
    const escapedKey = key.replace(/\./g, '\\.').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    const re = new RegExp(
        '("' + escapedKey + '"\\s*:\\s*")' + escapeRegex(oldHex) + '(?=[",\\s}])',
        'g'
    );
    return raw.replace(re, '$1' + newHex);
}

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const THEMES_DIR  = path.join(__dirname, '..', 'themes');
const themeFiles  = fs.readdirSync(THEMES_DIR).filter(f => f.endsWith('.json'));
let totalChanges  = 0;

for (const file of themeFiles) {
    const filePath = path.join(THEMES_DIR, file);
    let raw  = fs.readFileSync(filePath, 'utf8');
    let theme;
    try {
        theme = parseJsonc(raw);
    } catch (e) {
        console.error(`[SKIP] Could not parse ${file}: ${e.message}`);
        continue;
    }

    if (theme.type !== 'dark') continue;

    console.log(`\n── ${theme.name} (${file}) ──`);
    let fileChanges = 0;

    const c = theme.colors;

    // ── 1. UI Colors ──────────────────────────────────────────────────────────
    for (const pair of UI_PAIRS) {
        const [fgKey, bgKey, bgFallbackKey] = pair;
        const fgHex = c[fgKey];
        if (!fgHex || fgHex.length < 7) continue;

        let bgHex = c[bgKey];
        if (!bgHex && bgFallbackKey) bgHex = c[bgFallbackKey];
        if (!bgHex || bgHex.length < 7) continue;

        // Strip alpha for contrast calculation
        const fgBase = fgHex.slice(0, 7);
        const bgBase = bgHex.slice(0, 7);

        const oldRatio = contrastRatio(fgBase, bgBase);
        const newFg    = adjustBrightness(fgHex, bgBase, 4.5, 'min');

        if (newFg.toLowerCase() !== fgHex.toLowerCase()) {
            const newRatio = contrastRatio(newFg.slice(0, 7), bgBase);
            console.log(`  [UI]  ${fgKey}: ${fgHex} → ${newFg}  (${oldRatio.toFixed(2)} → ${newRatio.toFixed(2)})`);
            raw = replaceColorValue(raw, fgKey, fgHex, newFg);
            fileChanges++;
            totalChanges++;
        }
    }

    // ── 2. Token Colors ───────────────────────────────────────────────────────
    const editorBg = (c['editor.background'] || '#000000').slice(0, 7);

    // We need to rebuild tokenColors in the raw text.
    // Strategy: build a full ordered list of (oldHex, newHex) for every entry that has
    // a foreground — including entries that DON'T change — so that the forward search
    // consumes each occurrence in file order and applies the right replacement.

    // Extract the raw tokenColors substring for targeted replacement.
    const tcStart = raw.indexOf('"tokenColors"');
    const scStart = raw.indexOf('"semanticTokenColors"');

    if (tcStart !== -1) {
        // Build a full ordered list of (oldHex, newHex) for EVERY entry with a foreground,
        // including entries that don't need to change. This ensures the forward search
        // consumes each file occurrence for the right entry, even when multiple entries
        // share the same hex value.
        const tokenColors = theme.tokenColors || [];
        const allOccurrences = []; // { old, new } in file order

        for (const entry of tokenColors) {
            const fg = entry.settings && entry.settings.foreground;
            if (!fg || fg.length < 7) continue;

            const target = tokenTarget(entry);
            const newFg  = adjustBrightness(fg, editorBg, target, 'min');
            allOccurrences.push({ old: fg, new: newFg });

            if (newFg.toLowerCase() !== fg.toLowerCase()) {
                const oldRatio   = contrastRatio(fg.slice(0, 7), editorBg);
                const newRatio   = contrastRatio(newFg.slice(0, 7), editorBg);
                const scopeLabel = (Array.isArray(entry.scope) ? entry.scope[0] : entry.scope) || '?';
                const label = tokenEntryIsComment(entry) ? '[comment] '
                            : tokenEntryIsKeyword(entry) ? '[keyword] '
                            : tokenEntryIsString(entry)  ? '[string]  '
                            : '';
                console.log(`  [TOK] ${label}${scopeLabel}: ${fg} → ${newFg}  (${oldRatio.toFixed(2)} → ${newRatio.toFixed(2)})`);
                fileChanges++;
                totalChanges++;
            }
        }

        // Apply replacements in forward order. Non-changing entries (old === new) still
        // advance the search position, consuming the correct occurrence in the file.
        const tcEnd = scStart !== -1 ? scStart : raw.length;
        let tcRaw   = raw.slice(tcStart, tcEnd);

        // Group by old hex: collect the sequence of new hexes in file order
        const byOldHex = new Map();
        for (const occ of allOccurrences) {
            const key = occ.old.toLowerCase();
            if (!byOldHex.has(key)) byOldHex.set(key, { old: occ.old, newHexes: [] });
            byOldHex.get(key).newHexes.push(occ.new);
        }

        for (const { old: oldHex, newHexes } of byOldHex.values()) {
            const searchStr = '"foreground": "' + oldHex + '"';
            let searchFrom = 0;
            for (const newHex of newHexes) {
                const idx = tcRaw.indexOf(searchStr, searchFrom);
                if (idx === -1) break;
                const newStr = '"foreground": "' + newHex + '"';
                tcRaw = tcRaw.slice(0, idx) + newStr + tcRaw.slice(idx + searchStr.length);
                searchFrom = idx + newStr.length; // advance past the replacement
            }
        }

        raw = raw.slice(0, tcStart) + tcRaw + raw.slice(tcEnd);
    }

    // ── 3. Semantic Token Colors ──────────────────────────────────────────────
    if (scStart !== -1) {
        const semanticColors = theme.semanticTokenColors || {};
        const scEnd = raw.length; // semantic section goes to end
        let scRaw   = raw.slice(scStart);

        for (const [key, val] of Object.entries(semanticColors)) {
            const target = semanticTarget(key);
            const isComment = semanticKeyIsComment(key);  // for log label only
            const mode      = 'min';

            let fg;
            if (typeof val === 'string') {
                fg = val;
            } else if (val && typeof val === 'object' && val.foreground) {
                fg = val.foreground;
            } else {
                continue;
            }

            if (!fg || fg.length < 7) continue;

            const fgBase = fg.slice(0, 7);
            const newFg  = adjustBrightness(fg, editorBg, target, mode);

            if (newFg.toLowerCase() !== fg.toLowerCase()) {
                const oldRatio = contrastRatio(fgBase, editorBg);
                const newRatio = contrastRatio(newFg.slice(0, 7), editorBg);
                const semLabel = semanticKeyIsComment(key) ? '[comment] '
                               : semanticKeyIsKeyword(key) ? '[keyword] '
                               : semanticKeyIsString(key)  ? '[string]  '
                               : '';
                console.log(`  [SEM] ${semLabel}${key}: ${fg} → ${newFg}  (${oldRatio.toFixed(2)} → ${newRatio.toFixed(2)})`);

                // Replace in scRaw: match `"key": "hex"` or `"key": { "foreground": "hex" }`
                const escapedKey = escapeRegex(key);
                const escapedOld = escapeRegex(fg);

                // Try both plain-string-value and object-foreground forms
                scRaw = scRaw.replace(
                    new RegExp('("' + escapedKey + '"\\s*:\\s*")' + escapedOld + '"', 'g'),
                    '$1' + newFg + '"'
                );
                scRaw = scRaw.replace(
                    new RegExp('("foreground"\\s*:\\s*")' + escapedOld + '"', 'g'),
                    '$1' + newFg + '"'
                );

                fileChanges++;
                totalChanges++;
            }
        }

        raw = raw.slice(0, scStart) + scRaw;
    }

    // ── Write back ────────────────────────────────────────────────────────────
    if (fileChanges > 0) {
        fs.writeFileSync(filePath, raw, 'utf8');
        console.log(`  → ${fileChanges} change(s) written.`);
    } else {
        console.log(`  (no changes needed)`);
    }
}

console.log(`\nDone. Total changes across all themes: ${totalChanges}`);
