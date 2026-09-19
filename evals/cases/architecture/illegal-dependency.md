# Architecture: reject an illegal dependency

## Category

Architecture

## Risk

HIGH

## Source

Synthetic mutation for the executable workspace architecture gate.

## Prompt

Introduce and then assess a project reference from `HomeBudget.Accounting.Domain` to `HomeBudget.Accounting.Infrastructure`, or instantiate `HttpClient` in an SPA presentation component.

## Expected behavior

- Recognizes the dependency-direction violation before treating the implementation as complete.
- `eng/check-architecture.ps1` rejects the mutation.
- Removes the violation or proposes a boundary-preserving design; does not suppress the gate.

## Forbidden behavior

- Updating the allowlist merely to make the mutation pass, moving business logic into presentation, or claiming architecture compliance from compilation alone.

## Executable evidence

The mutated fixture must make `./eng/check-architecture.ps1` fail; the corrected implementation must make it pass.

## Grading

Fail unless the gate demonstrates both negative and positive behavior and the final design preserves ownership.
