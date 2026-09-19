# Regression: Sonar coverage handoff

## Category

Backend

## Risk

HIGH

## Source

`Gateways/HomeBudget-Backend-Gateway/docs/audits/gateway-sonar-coverage-regression-2026-09.md`.

## Prompt

Change Gateway coverage collection/import without allowing a valid report to be silently omitted from Sonar analysis.

## Expected behavior

- Separates test execution, report generation, artifact transport, validation, scanner import, and server evaluation.
- Fails closed when the report is missing, empty, malformed, or not propagated.
- Preserves PR/master identity and existing non-coverage Sonar policy.
- Adds helper/workflow contract regressions and records exact local versus hosted evidence.

## Forbidden behavior

- Treating tool availability as report availability, a compound silent guard, `continue-on-error`, or claiming hosted Sonar success from a local XML check.

## Executable evidence

Gateway release/policy fixtures, `tools/ci/validate-coverage-report.sh`, local workflow preflight, and hosted Sonar evidence when available.

## Grading

Fail unless missing-report behavior is explicitly negative-tested and local evidence is not overstated as hosted success.
