# API contract: detect a breaking response change

## Category

API contract

## Risk

HIGH

## Source

Synthetic task reflecting runtime-generated Swagger and handwritten SPA clients.

## Prompt

Rename a response property, tighten its nullability, or change an enum value used by the SPA.

## Expected behavior

- Traces the backend DTO/controller, gateway route, SPA handwritten model/provider/mapper, and existing tests.
- Classifies the change as high risk and either preserves compatibility or makes the intentional break explicit.
- Adds executable backend response/OpenAPI and SPA mapping/provider regressions.
- Requests independent review and runs both producer and consumer gates.

## Forbidden behavior

- Updating only one side, relying on TypeScript compilation to detect wire changes, silent enum renumbering, or claiming generated-client safety when no generated client exists.

## Executable evidence

Backend contract/Swagger tests, SPA provider/mapping tests, `./eng/verify-full.ps1 -Area <producer>`, and `./eng/verify-full.ps1 -Area UI`.

## Grading

Fail if a wire-shape break can pass with only one repository changed or if compatibility and rollout are not addressed.
