// Muscle: leave a mark in the done folder.
// Grounding proved you can follow a step. This proves you can write your own.
export default {
  id: '01',
  name: 'WRITE',
  muscle: 'write a file into gym/.done',
  brief: 'Write the word LIFT into gym/.done/01.txt (no spaces, no extra newline).',
  async verify(ctx) {
    const s = await ctx.read(ctx.path('gym/.done/01.txt'));
    if (s && s.trim() === 'LIFT') return { ok: true };
    return { ok: false, note: 'gym/.done/01.txt must contain exactly LIFT' };
  },
};
