// Muscle: read your own mark back.
// Writing blind is worthless. Confirm what you left.
export default {
  id: '02',
  name: 'READ',
  muscle: 'read a file back',
  brief: 'Read gym/.done/01.txt and confirm it contains exactly LIFT.',
  async verify(ctx) {
    const s = await ctx.read(ctx.path('gym/.done/01.txt'));
    if (s && s.trim() === 'LIFT') return { ok: true };
    return { ok: false, note: 'gym/.done/01.txt did not contain LIFT' };
  },
};
