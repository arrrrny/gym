// Demo agent — a script that solves the example exercises. Exists so the
// benchmark runs end-to-end with no external tools or API keys. Swap this for a
// real model adapter (see claude.mjs) to benchmark an actual agent.
import fs from 'node:fs/promises';
import path from 'node:path';

export default {
  id: 'solver',
  label: 'Solver (demo script)',
  tier: 'free',
  cost: 0,
  async drive({ sandbox }) {
    await fs.writeFile(path.join(sandbox, 'hello.mjs'), 'console.log("HELLO")\n');
    await fs.writeFile(path.join(sandbox, 'sum.mjs'), 'console.log(1 + 2)\n');
    await fs.writeFile(path.join(sandbox, 'reverse.mjs'), 'console.log("MIKI".split("").reverse().join(""))\n');
    await fs.mkdir(path.join(sandbox, 'pkg'), { recursive: true });
    await fs.writeFile(path.join(sandbox, 'pkg', 'run.mjs'), 'console.log("PKG")\n');
    return { ok: true };
  },
};
