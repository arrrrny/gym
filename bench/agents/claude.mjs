// Real-model adapter template. Wire any CLI coding agent the same way. Disabled
// by default so the offline demo keeps running; enable it with:
//
//   AGENTS=claude node bench/bench.mjs
//
// `cost` is your USD price per exercise — it drives the price/tier comparison in
// the report, so set it to whatever you actually pay (or estimate).
import { cliAgent } from '../lib/cli-agent.mjs';

export default cliAgent({
  id: 'claude',
  label: 'Claude CLI',
  tier: 'premium',
  cost: 0.05, // example usd per exercise — replace with your real number
  command: 'claude',
  args: ['-p', '{{brief}}'],
  disabled: true,
});
