// Graded exercise — manipulate a string and submit.
// The SUM exercise proved you can compute. This proves you can transform a
// string. The runner grades the submission once you drop .submitted.
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export default {
  id: 'X3',
  name: 'REVERSE',
  muscle: 'manipulate a string in the sandbox',
  brief:
    "Create gym/.sandbox/reverse.mjs that prints the reverse of the string 'MIKI' " +
    "(so it prints 'IKIM'). Then leave a gym/.sandbox/.submitted marker.",
  async evaluate(sandbox) {
    let code;
    try {
      code = await fs.readFile(path.join(sandbox, 'reverse.mjs'), 'utf8');
    } catch {
      return { pass: false, notes: 'no reverse.mjs in the sandbox' };
    }
    const r = spawnSync('node', [path.join(sandbox, 'reverse.mjs')], { encoding: 'utf8' });
    if (r.status !== 0) return { pass: false, notes: 'reverse.mjs exited non-zero: ' + r.stderr };
    if ((r.stdout || '').trim() !== 'IKIM') return { pass: false, notes: 'reverse.mjs did not print IKIM' };
    return { pass: true, notes: 'reverse.mjs prints IKIM' };
  },
};
