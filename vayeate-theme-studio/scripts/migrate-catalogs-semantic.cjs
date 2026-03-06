/**
 * One-off migration: add semanticTokenTypes, semanticTokenModifiers, semanticTokenLanguages
 * to existing catalog JSON files. Derives arrays from semantic token keys when present.
 */
const fs = require('fs');
const path = require('path');

const CATALOGS_DIR = path.join(__dirname, '..', 'data', 'catalogs');

function parseSemanticSelector(selector) {
  const trimmed = String(selector).trim();
  if (!trimmed) return { type: '', modifiers: [], language: null };
  const colonIndex = trimmed.indexOf(':');
  const languagePart = colonIndex >= 0 ? trimmed.slice(colonIndex + 1) : null;
  const beforeLanguage = colonIndex >= 0 ? trimmed.slice(0, colonIndex) : trimmed;
  const segments = beforeLanguage.split('.').map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) return { type: '', modifiers: [], language: languagePart };
  const type = segments[0];
  const modifiers = segments.slice(1);
  const language = languagePart === null || languagePart === '' ? null : languagePart;
  return { type, modifiers, language };
}

function migrateCatalog(obj) {
  if (Array.isArray(obj.semanticTokenTypes) && Array.isArray(obj.semanticTokenModifiers) && Array.isArray(obj.semanticTokenLanguages)) {
    return false; // already migrated
  }
  const typesSet = new Set();
  const modifiersSet = new Set();
  const languagesSet = new Set();
  const tokens = obj.tokens || [];
  for (const t of tokens) {
    if (t.type !== 'semantic token') continue;
    try {
      const parsed = parseSemanticSelector(t.key);
      if (parsed.type && parsed.type !== '*') typesSet.add(parsed.type);
      for (const m of parsed.modifiers) modifiersSet.add(m);
      if (parsed.language) languagesSet.add(parsed.language);
    } catch (_) { /* skip invalid */ }
  }
  obj.semanticTokenTypes = [...typesSet].sort();
  obj.semanticTokenModifiers = [...modifiersSet].sort();
  obj.semanticTokenLanguages = [...languagesSet].sort();
  return true;
}

const files = fs.readdirSync(CATALOGS_DIR).filter((f) => f.endsWith('.json'));
for (const file of files) {
  const filePath = path.join(CATALOGS_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (migrateCatalog(data)) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    console.log('Migrated:', file);
  } else {
    console.log('Skipped (already has semantic arrays):', file);
  }
}
