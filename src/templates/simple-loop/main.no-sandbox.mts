import { run, claudeCode } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";

// Simple loop: an agent that picks open issues one by one and closes them.
// Run this with: npx tsx .sandcastle/main.mts
// Or add to package.json scripts: "sandcastle": "npx tsx .sandcastle/main.mts"

await run({
  // A name for this run, shown as a prefix in log output.
  name: "worker",

  // Run the agent directly on the host.
  sandbox: docker(),

  // The agent provider and model are selected during init. Change the model
  // string here if this workflow needs a different capability or speed tradeoff.
  agent: claudeCode("claude-sonnet-4-6"),

  // Path to the prompt file. Shell expressions inside are evaluated in the
  // host worktree at the start of each iteration, so the agent sees fresh data.
  promptFile: "./.sandcastle/prompt.md",

  // Maximum number of iterations (agent invocations) to run in a session.
  // Each iteration works on a single issue. Increase this to process more issues
  // per run, or set it to 1 for a single-shot mode.
  maxIterations: 3,

  // Work on a temporary branch and merge the result back to HEAD.
  branchStrategy: { type: "merge-to-head" },

  // Reuse the host's installed dependencies in the worktree.
  copyToWorktree: ["node_modules"],
});
