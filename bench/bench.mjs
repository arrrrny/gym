#!/usr/bin/env node
// GYM BENCH — run the same exercises against N agents in parallel and compare.
//
// Every agent gets its own isolated sandbox. For each exercise the harness
// drives ALL agents at once (Promise.all), grades each submission with the
// exercise's own evaluate(), then aggregates into a comparison matrix:
// pass/fail per cell, timing, cost per tier, and cost-efficiency ($/pass).
//
//   node bench/bench.mjs                       run all enabled agents
//   AGENTS=claude,codex node bench/bench.mjs   run only these agents
//   GYM_TIMEOUT=120 node bench/bench.mjs       cap each agent drive at 120s
//
// Results print to the terminal and are written to bench/reports/<stamp>.md and
// bench/reports/latest.json so you can track a model's score over time.
import fs from 'node:fs/promises';
import path from 'node:path';
import { globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(__dirname, 'agents');
const EX_DIR = path.join(ROOT, 'exercises');
const RUNS = path.join(__dirname, '.runs');
const REPORTS = path.join(__dirname, 'reports');
const TIMEOUT = (Number(process.env.GYM_TIMEOUT) || 60) * 1000;
const ONLY = (process.env.AGENTS || '').split(',').map((s) => s.trim()).filter(Boolean);

async function loadAgents() {
  const files = globSync('*.mjs', { cwd: AGENTS_DIR }).sort();
  const agents = [];
  for (const f of files) {
    const mod = await import(path.join(AGENTS_DIR, f));
    const a = mod.default;
    if (!a || typeof a.drive !== 'function') continue;
    if (a.disabled && !ONLY.includes(a.id)) continue;
    agents.push(a);
  }
  return agents;
}

async function loadExercises() {
  const files = globSync('*.mjs', { cwd: EX_DIR }).sort();
  const exs = [];
  for (const f of files) {
    const mod = await import(path.join(EX_DIR, f));
    if (mod.default && typeof mod.default.evaluate === 'function') exs.push(mod.default);
  }
  // stable numeric sort on id so X1..X10 read left-to-right
  return exs.sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
}

async function runExercise(ex, agents) {
  // Drive every agent for this exercise in parallel.
  return Promise.all(
    agents.map(async (agent) => {
      const sandbox = path.join(RUNS, agent.id, String(ex.id));
      await fs.rm(sandbox, { recursive: true, force: true });
      await fs.mkdir(sandbox, { recursive: true });

      // Hand the agent the real sandbox path, not the literal "gym/.sandbox".
      const brief = String(ex.brief || '').split('gym/.sandbox').join(sandbox);

      const start = Date.now();
      let driveNotes = '';
      try {
        const r = await agent.drive({ brief, sandbox, timeoutMs: TIMEOUT });
        driveNotes = (r && r.notes) || '';
      } catch (e) {
        driveNotes = 'drive error: ' + e.message;
      }
      const ms = Date.now() - start;

      // The agent is done; mark the submission and grade what it left.
      await fs.writeFile(path.join(sandbox, '.submitted'), new Date().toISOString());
      let result = { pass: false, notes: 'no evaluator' };
      try {
        result = (await ex.evaluate(sandbox)) || result;
      } catch (e) {
        result = { pass: false, notes: e.message };
      }

      return {
        agent: agent.id,
        exercise: ex.id,
        pass: !!result.pass,
        notes: (result && result.notes) || driveNotes,
        ms,
      };
    })
  );
}

function printTable(matrix, agents, exercises) {
  const cell = (r) => (r && r.pass ? '✓' : '✗');
  const head = ['agent'.padEnd(10), ...exercises.map((e) => String(e.id).padEnd(4)), 'pass', 'rate', 'tier', '$/ex', 'total$', '$/pass'];
  console.log('\n' + head.join('  '));
  console.log('-'.repeat(head.join('  ').length));
  for (const a of agents) {
    const row = matrix[a.id] || {};
    const res = exercises.map((e) => row[e.id]);
    const passed = res.filter((r) => r && r.pass).length;
    const rate = Math.round((passed / exercises.length) * 100);
    const total = (a.cost || 0) * exercises.length;
    const perPass = passed > 0 && a.cost > 0 ? (total / passed).toFixed(4) : '-';
    const line = [
      a.id.padEnd(10),
      ...res.map((r) => cell(r).padEnd(4)),
      String(passed + '/' + exercises.length).padEnd(4),
      (rate + '%').padEnd(4),
      String(a.tier || '-').padEnd(4),
      String(a.cost || 0).padEnd(4),
      '$' + total.toFixed(3).padEnd(6),
      String(perPass).padEnd(6),
    ];
    console.log(line.join('  '));
  }
}

async function writeReport(matrix, agents, exercises) {
  await fs.mkdir(REPORTS, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const rows = agents.map((a) => {
    const row = matrix[a.id] || {};
    const res = exercises.map((e) => row[e.id]);
    const passed = res.filter((r) => r && r.pass).length;
    const rate = Math.round((passed / exercises.length) * 100);
    const total = (a.cost || 0) * exercises.length;
    const perPass = passed > 0 && a.cost > 0 ? +(total / passed).toFixed(4) : null;
    return {
      agent: a.id,
      label: a.label,
      tier: a.tier,
      costPerExercise: a.cost,
      passed,
      total: exercises.length,
      rate,
      totalCost: +total.toFixed(4),
      costPerPass: perPass,
      cells: exercises.map((e) => ({
        exercise: e.id,
        pass: !!(row[e.id] && row[e.id].pass),
        ms: row[e.id] ? row[e.id].ms : null,
        notes: row[e.id] ? row[e.id].notes : '',
      })),
    };
  });

  const md = [
    `# GYM BENCH — ${stamp}`,
    '',
    `agents: ${agents.length} · exercises: ${exercises.length} · timeout: ${TIMEOUT}ms`,
    '',
    '| agent | tier | $/ex | pass | rate | total$ | $/pass |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map(
      (r) =>
        `| ${r.label} | ${r.tier || '-'} | ${r.costPerExercise} | ${r.passed}/${r.total} | ${r.rate}% | $${r.totalCost} | ${r.costPerPass ?? '-'} |`
    ),
    '',
    '## per-exercise',
    ...rows.flatMap((r) => [
      '',
      `### ${r.label}`,
      ...r.cells.map((c) => `- [${c.pass ? 'PASS' : 'FAIL'}] ${c.exercise} (${c.ms}ms)${c.notes ? ' — ' + c.notes : ''}`),
    ]),
    '',
  ].join('\n');

  await fs.writeFile(path.join(REPORTS, `${stamp}.md`), md);
  await fs.writeFile(path.join(REPORTS, 'latest.json'), JSON.stringify({ stamp, rows }, null, 2));
  console.log(`\nreport: ${path.join(REPORTS, stamp + '.md')}`);
  console.log(`json:   ${path.join(REPORTS, 'latest.json')}`);
}

async function main() {
  const agents = await loadAgents();
  const exercises = await loadExercises();
  if (!agents.length) {
    console.log('No agents loaded. Add one to bench/agents/ or set AGENTS=<id>.');
    process.exit(0);
  }
  console.log(`GYM BENCH — ${agents.length} agent(s) × ${exercises.length} exercise(s), driven in parallel.`);
  console.log(`timeout: ${TIMEOUT}ms · agents: ${agents.map((a) => a.id).join(', ')}\n`);

  const matrix = {};
  for (const ex of exercises) {
    process.stdout.write(`[${ex.id}] ${ex.name}: driving ${agents.length} agent(s) in parallel... `);
    const res = await runExercise(ex, agents);
    for (const r of res) (matrix[r.agent] ||= {})[r.exercise] = r;
    const passed = res.filter((r) => r.pass).length;
    console.log(`${passed}/${agents.length} passed`);
  }

  printTable(matrix, agents, exercises);
  await writeReport(matrix, agents, exercises);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
