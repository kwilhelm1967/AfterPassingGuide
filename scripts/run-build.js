/**
 * Run production build (tsc + vite build).
 * Use if "npm run build" or build.bat don't work:
 *   node scripts/run-build.js
 * Requires: Node and npm installed; run from project root or script dir.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
process.chdir(root);

const nodeModules = path.join(root, 'node_modules');
if (!fs.existsSync(nodeModules)) {
  console.error('Run "npm install" first.');
  process.exit(1);
}

const tsc = path.join(nodeModules, '.bin', 'tsc');
const vite = path.join(nodeModules, '.bin', 'vite');
const isWin = process.platform === 'win32';
const tscCmd = isWin ? `"${tsc}.cmd"` : tsc;
const viteCmd = isWin ? `"${vite}.cmd"` : vite;

console.log('Building AfterPassing Guide...\n');
try {
  execSync(tscCmd, { stdio: 'inherit' });
  execSync(`${viteCmd} build`, { stdio: 'inherit' });
  console.log('\nBuild OK. Output is in the dist folder.');
} catch (err) {
  process.exit(1);
}
