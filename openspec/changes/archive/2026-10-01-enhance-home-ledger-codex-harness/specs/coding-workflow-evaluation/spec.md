# Spec Delta

## Purpose

Defines reproducible and tamper-aware evaluation of Codex coding outcomes using local authenticated tooling and deterministic graders.

## ADDED Requirements

### Requirement: HLE-001 Complete evaluation case contract
Each runnable coding-workflow case SHALL declare its task, allowed scope, fixed starting revisions, disposable fixture, relevant requirements, expected outcomes, executable grader commands, protected files, permitted actions, and bounded execution budget.

#### Scenario: Case validation
- **WHEN** the eval corpus is validated
- **THEN** a case missing any required contract field fails validation

### Requirement: HLE-002 Fail-closed deterministic grading
The result grader SHALL return PASS only when all required checks passed, expected outcomes are satisfied, protected files are unchanged, and no prohibited change or unresolved blocking condition exists.

#### Scenario: Known-good result
- **WHEN** a result contains passing required checks, unchanged protected hashes, and satisfied outcomes
- **THEN** the deterministic grader returns PASS

#### Scenario: Wrong output
- **WHEN** an independently expected outcome is false
- **THEN** the deterministic grader returns FAIL

#### Scenario: Required check omitted
- **WHEN** a required check has no result
- **THEN** the deterministic grader returns BLOCKED

#### Scenario: Protected grader altered
- **WHEN** a protected grading file differs from its recorded hash
- **THEN** the deterministic grader returns FAIL

### Requirement: HLE-003 Separated execution and grading
The harness SHALL separate starting a Codex trial, collecting its result, and grading the result so that implementing agents cannot treat their own assertions as authoritative expected outcomes.

#### Scenario: Authenticated local trial
- **WHEN** a user starts a supported automated trial
- **THEN** the harness invokes the installed authenticated Codex client without requiring an API key and stores the candidate outside protected grading material

### Requirement: HLE-004 Honest comparison reporting
Evaluation results SHALL record fixed revisions, harness version, model/configuration when available, elapsed time, human corrections, constraint violations, regressions, and available usage metrics without fabricating unavailable cost or token data.

#### Scenario: Single smoke trial
- **WHEN** only one enhanced-harness run exists and no trustworthy comparable baseline was executed
- **THEN** the result is labeled a smoke check and makes no improvement claim

