// Graded exercise — build a tiny script and submit.
// The HELLO exercise proved you can run a script. This proves you can compute and
// produce a graded result. The runner grades the submission once you drop .submitted.
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export default {
  id: 'X2',
  name: 'SUM',
  muscle: 'build and run a script in the sandbox',
  brief:
    'Create gym/.sandbox/sum.mjs that prints the number 3 (1 + 2). Then leave a ' +
    'gym/.sandbox/.submitted marker to submit.',
  async evaluate(sandbox) {
    let code;
    try {
      code = await fs.readFile(path.join(sandbox, 'sum.mjs'), 'utf8');
    } catch {
      return { pass: false, notes: 'no sum.mjs in the sandbox' };
    }
    if (!/[12]\s*[\+\-*\/]\s*[12]/.test(code)) {
      return { pass: false, notes: 'sum.mjs does not appear to compute with 1 and 2' };
    }
    const r = spawnSync('node', [path.join(sandbox, 'sum.mjs')], { encoding: 'utf8' });
    if (r.status !== 0) return { pass: false, notes: 'sum.mjs exited non-zero: ' + r.stderr };
    if ((r.stdout || '').trim() !== '3') return { pass: false, notes: 'sum.mjs did not print 3' };
    return { pass: true, notes: 'sum.mjs prints 3' };
  },
};
