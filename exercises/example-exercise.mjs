// Graded exercise — build in the sandbox and submit.
// The warmup proves you can follow a step. This proves you can build something
// on your own and leave proof the machine can grade. The runner runs evaluate()
// against your sandbox once you drop the .submitted marker.
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export default {
  id: 'X1',
  name: 'HELLO',
  muscle: 'build and submit in the sandbox',
  brief:
    'Create gym/.sandbox/hello.mjs that prints exactly "HELLO". Then leave a ' +
    'gym/.sandbox/.submitted marker to submit your work.',
  async evaluate(sandbox) {
    let code;
    try {
      code = await fs.readFile(path.join(sandbox, 'hello.mjs'), 'utf8');
    } catch {
      return { pass: false, notes: 'no hello.mjs in the sandbox' };
    }
    if (!/HELLO/.test(code)) {
      return { pass: false, notes: 'hello.mjs does not contain HELLO' };
    }
    const r = spawnSync('node', [path.join(sandbox, 'hello.mjs')], { encoding: 'utf8' });
    if (r.status !== 0) return { pass: false, notes: 'hello.mjs exited non-zero: ' + r.stderr };
    if ((r.stdout || '').trim() !== 'HELLO') {
      return { pass: false, notes: 'hello.mjs did not print exactly HELLO' };
    }
    return { pass: true, notes: 'hello.mjs prints HELLO' };
  },
};
