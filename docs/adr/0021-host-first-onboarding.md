# Host-first onboarding with explicit confirmation

## Context

Sandcastle can run an **agent** directly on the **host** through `noSandbox()`,
as established by ADR-0015. New-project onboarding nevertheless led with a
container image workflow, even when the user already had Claude Code or Codex
installed and authenticated on the host. That added an image build and separate
credential setup before a first run.

Direct host execution has a materially different trust boundary. The agent can
access files and processes available to the host user, and ADR-0019 records that
an abandoned No-sandbox process can outlive a timed-out run. A convenient default
must not make that choice invisible or describe AI-mediated command approval as
filesystem isolation.

## Decision

Interactive initialization lists the **No-sandbox provider** first and
preselects it, but the sandbox selection remains a prompt that the user must
explicitly submit. Non-interactive initialization continues to require an
explicit `--sandbox` value, including `--sandbox no-sandbox`.

The Quick Start uses a host-installed, authenticated Claude Code or Codex CLI.
Generated No-sandbox configurations select the agent provider's AI-mediated
approval mode where one exists and use a worktree-based branch strategy for
ordinary unattended work. These controls reduce accidental changes but do not
isolate the agent from the host filesystem.

Docker, Podman, Vercel, and custom sandbox providers remain available and
documented as explicit alternatives. Their image and environment setup stays in
their provider-specific documentation. Existing configurations and
Dockerfiles/Containerfiles are not rewritten or removed.

## Consequences

- A first-time interactive user sees the shortest host workflow first while
  still making the trust decision themselves.
- Automation records the provider choice in `--sandbox` rather than inheriting
  an implicit host-execution default.
- Users who require a container, VM, remote environment, or custom boundary keep
  the existing provider APIs and initialization choices.
- The public runtime defaults of `run()`, `createSandbox()`, `interactive()`,
  `claudeCode()`, and `codex()` do not change. This decision applies to onboarding
  and newly generated configuration only.
