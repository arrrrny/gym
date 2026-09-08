// Demo agent — solves everything except the REVERSE exercise, on purpose. Shows
// how the comparison table surfaces per-model weak spots.
import fs from 'node:fs/promises';
import path from 'node:path';

export default {
  id: 'flaky',
  label: 'Flaky (demo script)',
  tier: 'free',
  cost: 0,
  async drive({ sandbox }) {
    await fs.writeFile(path.join(sandbox, 'hello.mjs'), 'console.log("HELLO")\n');
    await fs.writeFile(path.join(sandbox, 'sum.mjs'), 'console.log(1 + 2)\n');
    // gets REVERSE wrong on purpose so the comparison is interesting
    await fs.writeFile(path.join(sandbox, 'reverse.mjs'), 'console.log("MIKI")\n');
    await fs.mkdir(path.join(sandbox, 'pkg'), { recursive: true });
    await fs.writeFile(path.join(sandbox, 'pkg', 'run.mjs'), 'console.log("PKG")\n');
    return { ok: true };
  },
};
