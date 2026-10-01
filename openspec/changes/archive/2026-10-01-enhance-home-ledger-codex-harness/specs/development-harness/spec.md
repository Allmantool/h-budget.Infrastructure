# Spec Delta

## Purpose

Defines a discoverable, proportional, and independently verifiable development workflow for changes across the Home Ledger repositories.

## ADDED Requirements

### Requirement: HLH-001 Discoverable repository guidance
Each Git repository in the authorized harness scope (Infra, SPA, Gateway, Rates, and Accounting) SHALL expose its applicable `AGENTS.md` guidance and reusable skills through locations supported by the installed Codex client, without depending on an absolute developer-machine path.

#### Scenario: Repository opened independently
- **WHEN** Codex starts from an in-scope application repository root
- **THEN** repository instructions and repository-owned skills are discoverable from that Git root

### Requirement: HLH-002 Proportional specification lifecycle
The harness SHALL require a durable OpenSpec change for substantive behavior, contract, persistence, concurrency, financial, or cross-repository work and SHALL permit a documented lightweight exception for tiny reversible or narrowly scoped fixes.

#### Scenario: Substantive cross-repository change
- **WHEN** a change spans independently deployable repositories
- **THEN** one change ID identifies the authoritative requirements, participating revisions, compatibility constraints, tasks, and evidence

#### Scenario: Tiny reversible change
- **WHEN** a change is presentational, mechanical, or otherwise low risk
- **THEN** a focused goal and verification note are sufficient without artificial specification artifacts

### Requirement: HLH-003 Native role routing and handoff
The harness SHALL expose native project-scoped roles for the default Analyst to Implementer to Verifier flow and the expanded Requirements, Architect, Implementer, Evaluator, and Tester flow, with model choice inherited unless explicitly overridden.

#### Scenario: Default workflow handoff
- **WHEN** an Analyst hands a scoped candidate to an Implementer or a candidate to a Verifier
- **THEN** the handoff identifies the change, authoritative requirements, repositories and revisions, owned paths, constraints, checks, unresolved questions, and expected result format

#### Scenario: Independent verdict
- **WHEN** an Evaluator or Tester reviews a candidate
- **THEN** it reports PASS, FAIL, or BLOCKED and lists every required check that was skipped or unavailable

### Requirement: HLH-004 Safe verification boundaries
The harness SHALL keep all automated checks away from live Home Ledger environments and real financial fixtures unless a later request provides explicit exact-target authorization.

#### Scenario: Workspace verification
- **WHEN** a harness or application verification command runs
- **THEN** it uses static checks, synthetic fixtures, or disposable local infrastructure and does not access `vm2.linux` or `192.168.5.159`

### Requirement: HLH-005 Evidence-backed completion
The harness SHALL map each harness requirement to an executable or explicitly manual evidence item and SHALL prevent a missing required check from producing an overall PASS.

#### Scenario: Required check unavailable
- **WHEN** required evidence was not produced
- **THEN** the final readiness matrix records the item as BLOCKED or NOT RUN rather than PASS
