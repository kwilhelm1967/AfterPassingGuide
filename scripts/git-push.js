#!/usr/bin/env node
const { execSync } = require('child_process');
const cwd = __dirname + '/..';

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', cwd, ...opts });
}

const message = process.argv[2] || 'Compact checklist, de-emphasize Edit/Info, tighten padding';

run('git add -A');
run('git commit -m "' + message.replace(/"/g, '\\"') + '"');
run('git push');
