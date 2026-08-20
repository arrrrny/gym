#!/usr/bin/env node
// GYM reference runner. Loads every exercise in gym/ and verifies the operator
// actually did the reps. Tests the operator, not the software.
import fs from 'node:fs/promises';
import { globSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ctx = {
  fs,
  path: (...p) => path.join(__dirname, ...p),
  async read(p) {
    try {
      return await fs.readFile(p, 'utf8');
    } catch {
      return null;
    }
  },
  async write(p, s) {
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, s, 'utf8');
  },
  log: (m) => process.stdout.write('    ' + m + '\n'),
};

const files = globSync('gym/*.mjs', { cwd: __dirname }).sort();
const exercises = [];
for (const f of files) {
  const mod = await import(path.join(__dirname, f));
  if (mod.default) exercises.push(mod.default);
}

console.log(`GYM — ${exercises.length} exercise(s). Grow or stay weak.\n`);

let grown = 0;
for (const ex of exercises) {
  process.stdout.write(`[${ex.id}] ${ex.name}  (muscle: ${ex.muscle})\n`);
  process.stdout.write(`    ${ex.brief}\n`);
  try {
    const res = await ex.verify(ctx);
    if (res && res.ok) {
      console.log('    GROWN\n');
      grown++;
    } else {
      console.log(`    WEAK — ${res?.note || 'verify returned false'}\n`);
    }
  } catch (e) {
    console.log(`    WEAK — ${e.message}\n`);
  }
}

console.log(`BOARD: ${grown}/${exercises.length} muscles grown.`);
if (grown < exercises.length) {
  console.log('NOT READY. Get back on the bench.');
  process.exit(1);
}
console.log('READY. You wield it. Go.');
