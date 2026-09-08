// Demo agent — does nothing. The control group: a participant that never
// touches the sandbox, so every exercise fails. Useful to confirm the grader
// rejects empty submissions.
export default {
  id: 'blind',
  label: 'Blind (demo script)',
  tier: 'free',
  cost: 0,
  async drive() {
    return { ok: true };
  },
};
