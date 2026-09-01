// Sequential Reviewer — implement-then-review loop
//
// Each cycle creates one host worktree. The implementer and reviewer run in
// that same worktree, and their commits are merged back to HEAD.
//
// Usage:
//   npx tsx .sandcastle/main.mts
// Or add to package.json:
//   "scripts": { "sandcastle": "npx tsx .sandcastle/main.mts" }

import * as sandcastle from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";

const MAX_ITERATIONS = 10;

for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
  console.log(`\n=== Iteration ${iteration}/${MAX_ITERATIONS} ===\n`);

  const worktree = await sandcastle.createWorktree({
    branchStrategy: { type: "merge-to-head" },
    copyToWorktree: ["node_modules"],
  });

  try {
    const sandbox = await worktree.createSandbox({
      sandbox: docker(),
    });

    try {
      // Keep the fork point because merge-to-head advances the target branch
      // after implementation, before the reviewer starts.
      const baseCommit = await sandbox.exec("git rev-parse HEAD");

      const implement = await sandbox.run({
        name: "implementer",
        maxIterations: 1,
        agent: sandcastle.claudeCode("claude-sonnet-4-6"),
        promptFile: "./.sandcastle/implement-prompt.md",
      });

      if (!implement.commits.length) {
        console.log("Implementation agent made no commits. Stopping.");
        break;
      }

      console.log(`\nImplementation complete on branch: ${worktree.branch}`);
      console.log(`Commits: ${implement.commits.length}`);

      await sandbox.run({
        name: "reviewer",
        maxIterations: 1,
        agent: sandcastle.claudeCode("claude-sonnet-4-6"),
        promptFile: "./.sandcastle/review-prompt.md",
        promptArgs: {
          BASE_COMMIT: baseCommit.stdout.trim(),
          BRANCH: worktree.branch,
        },
      });

      console.log("\nReview complete.");
    } finally {
      await sandbox.close();
    }
  } finally {
    await worktree.close();
  }
}

console.log("\nAll done.");
