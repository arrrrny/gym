// Graded exercise — lay out a package and submit.
// The SUM/REVERSE exercises proved you can build a file. This proves you can
// build a nested structure. The runner grades the submission once you drop .submitted.
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export default {
  id: 'X4',
  name: 'PKG',
  muscle: 'build a nested structure in the sandbox',
  brief:
    "Create gym/.sandbox/pkg/run.mjs that prints 'PKG'. Then leave a " +
    'gym/.sandbox/.submitted marker.',
  async evaluate(sandbox) {
    const main = path.join(sandbox, 'pkg', 'run.mjs');
    try {
      await fs.readFile(main, 'utf8');
    } catch {
      return { pass: false, notes: 'no pkg/run.mjs in the sandbox' };
    }
    const r = spawnSync('node', [main], { encoding: 'utf8' });
    if (r.status !== 0) return { pass: false, notes: 'pkg/run.mjs exited non-zero: ' + r.stderr };
    if ((r.stdout || '').trim() !== 'PKG') return { pass: false, notes: 'pkg/run.mjs did not print PKG' };
    return { pass: true, notes: 'pkg/run.mjs prints PKG' };
  },
};
