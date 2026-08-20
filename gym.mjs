#!/usr/bin/env node
// GYM reference runner — two phases. Phase 1 WARMUP reps grow the operator's
// reflexes to use the software (verify against the operator). Phase 2 EXERCISES
// hand a brief and a sandbox; the operator builds it solo, leaves a .submitted
// marker, and the runner grades it with evaluate(sandbox). Pass both boards and
// the gate opens — you are cleared to use the real thing.
//
//   node gym.mjs                      runs warmup + exercises
//   GYM_EXERCISES=skip node gym.mjs  warmup only
//   GYM_TIMEOUT=20 node gym.mjs      cap the exercise wait at 20s
import fs from 'node:fs/promises';
import { globSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SANDBOX = path.join(__dirname, 'gym', '.sandbox');
const TIMEOUT = Number(process.env.GYM_TIMEOUT || 60);
const SKIP_EX = process.env.GYM_EXERCISES === 'skip';

const ctx = {
  fs,
  path: (...p) => path.join(__dirname, ...p),
  sandbox: SANDBOX,
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

async function waitForSubmit(sandbox, timeoutSec) {
  const marker = path.join(sandbox, '.submitted');
  const deadline = Date.now() + timeoutSec * 1000;
  return new Promise((resolve) => {
    const tick = async () => {
      try {
        await fs.access(marker);
        return resolve(true);
      } catch {
        if (Date.now() >= deadline) return resolve(false);
        process.stdout.write('.');
        setTimeout(tick, 2000);
      }
    };
    tick();
  });
}

// Load every rep/exercise from gym/ and exercises/. A WARMUP rep exposes
// verify(ctx). A graded EXERCISE exposes evaluate(sandbox). Split by which.
const files = [
  ...globSync('gym/*.mjs', { cwd: __dirname }),
  ...globSync('exercises/*.mjs', { cwd: __dirname }),
].sort();
const modules = [];
for (const f of files) {
  const mod = await import(path.join(__dirname, f));
  if (mod.default) modules.push(mod.default);
}
const warmups = modules.filter((e) => typeof e.verify === 'function');
const exercises = modules.filter((e) => typeof e.evaluate === 'function');

console.log(`GYM — ${warmups.length} warmup rep(s), ${exercises.length} exercise(s).`);
console.log(`sandbox: ${SANDBOX}\n`);

console.log(`PHASE 1 — WARMUP (${warmups.length} rep(s)). Grow or stay weak.\n`);
let grown = 0;
for (const ex of warmups) {
  process.stdout.write(`[${ex.id}] ${ex.name}  (muscle: ${ex.muscle})\n    ${ex.brief}\n`);
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

console.log(`BOARD: ${grown}/${warmups.length} muscles grown.\n`);
if (grown < warmups.length) {
  console.log('NOT READY. Finish the warmup before any exercise.');
  process.exit(1);
}

console.log(`PHASE 2 — EXERCISES (${exercises.length}). Build it solo, then submit. The gate grades you.\n`);
let passed = 0;
for (const ex of exercises) {
  process.stdout.write(`[${ex.id}] ${ex.name}  (muscle: ${ex.muscle})\n    ${ex.brief}\n    sandbox: ${SANDBOX}\n`);
  if (SKIP_EX) {
    console.log('    SKIPPED (GYM_EXERCISES=skip)\n');
    continue;
  }
  process.stdout.write(`    waiting for .submitted (${TIMEOUT}s)\n    `);
  const submitted = await waitForSubmit(SANDBOX, TIMEOUT);
  if (!submitted) {
    console.log('\n    NO SUBMISSION within timeout.');
  } else {
    console.log('\n    SUBMITTED.');
  }
  try {
    const r = await ex.evaluate(SANDBOX);
    if (r && r.pass) {
      console.log(`    PASSED — ${r.notes || ''}\n`);
      passed++;
    } else {
      console.log(`    FAILED — ${r?.notes || 'evaluate returned false'}\n`);
    }
  } catch (e) {
    console.log(`    FAILED — ${e.message}\n`);
  }
}

if (SKIP_EX) {
  console.log(`READY (warmup). Exercises skipped — rerun without GYM_EXERCISES=skip to clear the gate.`);
  process.exit(0);
}

console.log(`EXERCISES: ${passed}/${exercises.length} passed.`);
if (passed < exercises.length) {
  console.log('GATE CLOSED. You did not clear the exercises.');
  process.exit(1);
}
console.log('GATE OPEN. You wield it. Go.');
