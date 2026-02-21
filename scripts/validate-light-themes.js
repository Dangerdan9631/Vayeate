'use strict';
const fs   = require('fs');
const path = require('path');

function stripComments(src) {
    let r = '', i = 0;
    while (i < src.length) {
        if (src[i] === '"') {
            let j = i + 1;
            while (j < src.length) {
                if (src[j] === '\\') { j += 2; continue; }
                if (src[j] === '"')  { j++; break; }
                j++;
            }
            r += src.slice(i, j); i = j; continue;
        }
        if (src[i] === '/' && src[i+1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
        if (src[i] === '/' && src[i+1] === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i+1] === '/')) i++; i += 2; continue; }
        r += src[i++];
    }
    return r;
}
function parseJsonc(src) { return JSON.parse(stripComments(src).replace(/,(\s*[}\]])/g, '$1')); }

function hexToRgb(hex) {
    const h = hex.replace('#', '').slice(0, 6);
    return [parseInt(h.slice(0,2),16)/255, parseInt(h.slice(2,4),16)/255, parseInt(h.slice(4,6),16)/255];
}
function toLinear(c) { return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); }
function lum(hex) { const [r,g,b] = hexToRgb(hex).map(toLinear); return 0.2126*r + 0.7152*g + 0.0722*b; }
function cr(fg, bg) {
    if (!fg || !bg) return null;
    const f = fg.slice(0,7), b = bg.slice(0,7);
    const l1 = lum(f), l2 = lum(b);
    return (Math.max(l1,l2)+0.05) / (Math.min(l1,l2)+0.05);
}

const THEMES_DIR = path.join(__dirname, '..', 'themes');
const lightFiles = fs.readdirSync(THEMES_DIR).filter(f => f.includes('-light-'));
let allOk = true;

for (const file of lightFiles) {
    const lightPath = path.join(THEMES_DIR, file);
    const darkFile  = file.replace('-light-color-theme.json', '-color-theme.json');
    const darkPath  = path.join(THEMES_DIR, darkFile);

    const theme = JSON.parse(fs.readFileSync(lightPath, 'utf8'));
    const dark  = parseJsonc(fs.readFileSync(darkPath, 'utf8'));

    const c  = theme.colors;
    const bg = c['editor.background'];

    // 1. Toolbar match
    const toolbarKeys = ['titleBar.activeBackground','menu.background','activityBar.background','statusBar.background'];
    let toolbarOk = true;
    for (const k of toolbarKeys) {
        if (dark.colors[k] && c[k] !== dark.colors[k]) { toolbarOk = false; break; }
    }

    // 2. Token color contrast
    const tc = theme.tokenColors || [];
    const findToken = (scope) => tc.find(e => (Array.isArray(e.scope) ? e.scope : [e.scope]).some(s => s === scope));
    const kw = findToken('keyword');
    const cm = findToken('comment');
    const st = findToken('string');
    const kwCR = kw && kw.settings.foreground ? cr(kw.settings.foreground, bg) : null;
    const cmCR = cm && cm.settings.foreground ? cr(cm.settings.foreground, bg) : null;
    const stCR = st && st.settings.foreground ? cr(st.settings.foreground, bg) : null;

    const kwOk = kwCR === null || kwCR >= 6.0;
    const cmOk = cmCR === null || cmCR >= 3.0;
    const stOk = stCR === null || stCR >= 4.0;
    const ok   = toolbarOk && kwOk && cmOk && stOk;
    if (!ok) allOk = false;

    const pad = (s, n) => String(s).padEnd(n);
    console.log(
        (ok ? '[OK]  ' : '[FAIL]'),
        pad(file, 44),
        'bg:', bg,
        'toolbar:', toolbarOk ? 'ok' : 'MISMATCH',
        '| kw:', kwCR !== null ? (kwOk ? kwCR.toFixed(2) : 'FAIL(' + kwCR.toFixed(2) + ')') : 'n/a',
        '| cm:', cmCR !== null ? (cmOk ? cmCR.toFixed(2) : 'FAIL(' + cmCR.toFixed(2) + ')') : 'n/a',
        '| str:', stCR !== null ? (stOk ? stCR.toFixed(2) : 'FAIL(' + stCR.toFixed(2) + ')') : 'n/a'
    );
}

console.log(allOk ? '\nAll themes valid.' : '\nSome themes have issues!');
process.exit(allOk ? 0 : 1);
