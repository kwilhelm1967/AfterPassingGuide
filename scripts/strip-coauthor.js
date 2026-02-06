/**
 * Strip "Co-authored-by: Cursor <cursoragent@cursor.com>" from commit message file.
 * Used by .git/hooks/prepare-commit-msg so AI co-author lines are never committed.
 */
const fs = require('fs');
const path = process.argv[2];
if (!path || !fs.existsSync(path)) process.exit(0);
const re = /^\s*Co-authored-by:\s*Cursor\s*<cursoragent@cursor\.com>\s*$/gm;
let content = fs.readFileSync(path, 'utf8');
const next = content.replace(re, '').replace(/\n{3,}/g, '\n\n').trimEnd();
if (next !== content) fs.writeFileSync(path, next + (next.endsWith('\n') ? '' : '\n'));
process.exit(0);
