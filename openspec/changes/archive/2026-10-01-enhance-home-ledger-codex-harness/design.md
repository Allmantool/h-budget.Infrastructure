# Design

## Context

See `proposal.md`. The root is an infrastructure/harness Git repository containing four independent application Git repositories. Existing guidance is strong but its skills use the legacy `.codex/skills` path, no native project agents exist, and the eval corpus validates Markdown shape rather than task outcomes. Live systems are explicitly outside the authorization boundary.

## Goals / Non-Goals

**Goals:**

- Keep one root-owned cross-repository workflow while preserving repository-local usability.
- Use the installed Codex and OpenSpec schemas rather than invented configuration.
- Make deterministic workflow grading fail closed and cheap enough for CI.
- Retain evidence that distinguishes observed checks from written guidance.

**Non-Goals:**

- Repair application findings, redesign CI in application repositories, deploy, migrate data, or exercise live infrastructure.
- Add an orchestrator service, API subscription, hosted eval product, or Spec Kit.
- Require full OpenSpec ceremony for low-risk edits.

## Decisions

### Use the root repository as the cross-repository specification owner

Cross-repository changes receive one root OpenSpec change ID. Participating application repositories reference that ID and their revisions in handoffs/evidence. This avoids the beta OpenSpec Stores feature and a second planning service. Repository-local changes may use their existing mature specification workflow until deliberately migrated.

Alternative considered: initialize OpenSpec in every repository. Rejected because it would duplicate generated skills and create competing authorities without a demonstrated need.

### Use supported native role TOML plus focused role references

Project agents live under root `.codex/agents`; shared detailed responsibilities live under `.codex/roles`. Default combined agents read the same focused role references used by the expanded flow. Read-only roles use a read-only sandbox; roles that must execute tests use workspace-write plus explicit path constraints because test tools create outputs.

Alternative considered: Markdown role prompts only. Rejected because they are not native agent definitions and cannot be discovered as named roles.

### Move repository skills instead of duplicating adapters

Existing skill directories move from `.codex/skills` to `.agents/skills`, the location documented for current repository discovery. Content is preserved except where validation requires frontmatter or stale links to be corrected.

Alternative considered: keep both paths. Rejected because duplicate skill names can both appear and drift.

### Add a JSON eval contract and deterministic PowerShell grader

Human-readable case prompts remain Markdown, while `case.json` and result JSON carry enforceable fields. The runner verifies exact revisions and protected hashes, executes declared commands, and emits evidence; the grader has explicit precedence: tampering or wrong outcomes are FAIL, missing required evidence is BLOCKED, otherwise PASS.

Alternative considered: model-only grading. Rejected because it cannot override deterministic correctness and integrity assertions.

### Separate repository-only CI from full workspace verification

Root CI validates root-owned harness files and synthetic eval fixtures. Workspace verification additionally checks nested repositories when they are present. The mode is explicit; CI does not silently claim nested application coverage.

## Risks / Trade-offs

- [Generated OpenSpec skills are sizeable] -> Pin the generator version and validate generated metadata; do not hand-edit generated workflow behavior without an upstream reason.
- [Native roles are root-project scoped] -> Repository `AGENTS.md` and repo-owned skills remain sufficient when an application repository is opened independently; cross-repository coordination starts from the workspace root.
- [Workspace-write verifier can technically edit files] -> Split read-only Evaluator from test-running Tester and require candidate-diff integrity checks; document that guidance is not an OS security boundary.
- [Moving skills changes discovery for older clients] -> Target the installed Codex 0.114.0 and document the minimum verified client; Git history preserves the previous layout.
- [Synthetic evals do not prove application behavior] -> Keep application tests as Layer A and workflow evals as Layer B; report them separately.

## Migration Plan

1. Pin and initialize OpenSpec at the root, then validate this change.
2. Add native roles and a concise root delivery skill.
3. Move legacy repository skills to supported discovery paths.
4. Add eval manifests, grader tests, verification/CI wiring, audit, and runbook.
5. Run focused and full harness checks, repository gates for every modified repository, a disposable pilot, and fresh independent review.

Rollback is a normal Git revert per owning repository. No runtime or data migration is involved.
