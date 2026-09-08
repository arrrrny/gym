// CLI agent adapter. Wraps any command-line coding agent (claude, codex, kimi,
// aider, openhands, ...) as a GYM benchmark participant.
//
// The agent is spawned once per exercise. The brief and the real sandbox path
// are handed to it two ways: as `{{brief}}` / `{{sandbox}}` placeholders inside
// `args`, and as the GYM_BRIEF / GYM_SANDBOX environment variables. The agent
// does its work inside the sandbox; when the process exits, the harness grades
// whatever it left behind.
import { spawn } from 'node:child_process';

export function cliAgent({ id, label, tier = '', cost = 0, command, args = [], env = {}, disabled = false }) {
  return {
    id,
    label: label || id,
    tier,
    cost,
    kind: 'cli',
    disabled,
    async drive({ brief, sandbox, timeoutMs = 60000 }) {
      const filled = args.map((a) =>
        String(a).split('{{brief}}').join(brief).split('{{sandbox}}').join(sandbox)
      );
      const fullEnv = { ...process.env, ...env, GYM_BRIEF: brief, GYM_SANDBOX: sandbox };
      const child = spawn(command, filled, { env: fullEnv, stdio: ['ignore', 'pipe', 'pipe'] });
      let out = '';
      let err = '';
      child.stdout.on('data', (d) => (out += d));
      child.stderr.on('data', (d) => (err += d));
      const exitCode = await Promise.race([onClose(child), onTimeout(child, timeoutMs)]);
      const tail = (out + err).trim().slice(-800);
      const notes = exitCode === 'timeout'
        ? `timed out after ${timeoutMs}ms`
        : exitCode === 0
          ? tail
          : `exit ${exitCode}\n${tail}`;
      return { ok: exitCode === 0, notes };
    },
  };
}

function onClose(child) {
  return new Promise((resolve) => child.on('close', (code) => resolve(code ?? 1)));
}

function onTimeout(child, ms) {
  return new Promise((resolve) => {
    const t = setTimeout(() => {
      try {
        child.kill('SIGTERM');
      } catch {
        /* already gone */
      }
      resolve('timeout');
    }, ms);
    // never let this timer keep the process alive on its own
    if (typeof t.unref === 'function') t.unref();
  });
}
