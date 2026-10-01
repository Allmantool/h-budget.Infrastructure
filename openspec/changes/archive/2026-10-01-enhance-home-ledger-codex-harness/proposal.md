# Proposal

## Why

Home Ledger already has strong repository-specific guidance and verification, but the workspace harness is not fully discoverable by the installed Codex version and its coding-workflow evals are descriptive rather than fail-closed. This change makes the existing workflow executable and independently reviewable without changing application behavior or touching live environments.

## What Changes

- Pin OpenSpec as a root development dependency and use its supported Codex skill integration.
- Add project-scoped native Analyst, Implementer, Verifier, Requirements, Architect, Evaluator, and Tester roles with inherited model selection and explicit handoff/verdict rules.
- Move existing repository skills to the currently supported `.agents/skills` discovery path.
- Add deterministic workflow-eval manifests, result grading, protected-file checks, and negative tests.
- Add root CI and verification checks for harness schemas, links, OpenSpec artifacts, role discovery, and eval behavior.
- Record the multi-repository baseline, requirement-to-evidence traceability, runbook, application verification inventory, and prioritized out-of-scope backlog.

## Capabilities

### New Capabilities

- `development-harness`: Proportional specification, role routing, handoff, verification, and evidence requirements for Home Ledger changes.
- `coding-workflow-evaluation`: Reproducible, fail-closed evaluation of Codex task outcomes without an API key or live-system access.

### Modified Capabilities

None. This is the first OpenSpec change in the root harness.

## Impact

The root infrastructure repository owns the OpenSpec configuration, native roles, shared workflows, eval tooling, CI, and audit documents. UI, Gateway, Rates, Accounting, and Orchestration only receive skill-discovery path corrections; no application source, public API, database schema, deployment, or production configuration changes are in scope. The OpenSpec package is development-only and pinned exactly.
