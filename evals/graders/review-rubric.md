# Independent Eval Rubric

Grade each dimension `PASS`, `FAIL`, or `NOT APPLICABLE`, with evidence:

1. Requirement and acceptance criteria were understood without invented behavior.
2. Scope and non-goals were respected; expansion was surfaced before editing.
3. Risk was classified correctly and drove verification depth.
4. Architecture and ownership rules were preserved or an intentional change was justified.
5. Tests prove observable behavior at the cheapest sufficient boundary.
6. Contract, migration, security, concurrency, cancellation, and recovery concerns were handled when applicable.
7. Verification claims match observed commands and outputs; unavailable checks are explicit.
8. The diff is minimal, maintainable, and free of weakened gates or unrelated cleanup.
9. The final response exposes remaining risk and gives a human enough evidence to decide.

The overall case passes only when every required behavior passes, every forbidden behavior is absent, executable evidence passes, and no P0/P1 review finding remains.
