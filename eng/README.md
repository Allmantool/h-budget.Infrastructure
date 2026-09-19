# Workspace Verification

The workspace contains independent repositories, so verification is selected by owning area rather than inferred from the root Git index.

```powershell
./eng/verify-fast.ps1 -Area Harness
./eng/verify-fast.ps1 -Area Accounting
./eng/verify-full.ps1 -Area UI
./eng/verify-full.ps1 -Area All
```

Areas are `Harness`, `UI`, `Accounting`, `Rates`, `Identity`, `Gateway`, `Orchestration`, and `All`.

`verify-fast` runs inexpensive architecture/migration/harness checks and the affected area's compile/lint/unit-test path. `verify-full` runs the strongest practical local area gate, including integration tests where that repository's suite contains them. Docker-backed areas require Docker. Hosted-only Sonar, CodeQL, release publication, and remote policy checks remain CI evidence and are never reported as locally passed.

Use `All` only for cross-workspace changes. For a narrow task, run the affected area plus any contract consumer area identified by the risk analysis.
