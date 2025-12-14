# Testing Strategy

## Levels of Testing

### 1. Unit Tests
- **Scope:** Individual utility functions (`utils/treeHelpers.ts`) and stateless components.
- **Tool:** Vitest / Jest.
- **Coverage Goal:** 80%.

### 2. Integration Tests
- **Scope:** Interaction between `App.tsx` state machine and `services/gemini.ts`.
- **Strategy:** Mock the Gemini API responses to test state transitions (Planning -> Designing -> Building).

### 3. E2E Tests (Future)
- **Scope:** Full user flow from Prompt to Download.
- **Tool:** Playwright.

## Test Data
Fixture data is located in `tests/fixtures/`.
- `samplePRD.json`: A standard PRD for testing rendering.
- `sampleUITree.json`: A complex UI tree for testing performance.

## Manual QA Checklist
- [ ] Dark mode contrast check.
- [ ] Mobile responsiveness (drag handles working?).
- [ ] API Failure handling (does the error toast appear?).
