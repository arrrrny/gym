// Muscle: follow instructions + leave proof.
// This rep is not a test of the GYM. It is you proving you can do a thing and
// show the receipt. That reflex — do it, then prove it — is the whole point.
export default {
  id: '00',
  name: 'GROUNDING',
  muscle: 'follow instructions, leave proof',
  brief: 'Write the word GROW into gym/.done/00.txt (no spaces, no extra newline).',
  async verify(ctx) {
    const s = await ctx.read(ctx.path('gym/.done/00.txt'));
    if (s && s.trim() === 'GROW') return { ok: true };
    return { ok: false, note: 'gym/.done/00.txt must contain exactly GROW' };
  },
};
