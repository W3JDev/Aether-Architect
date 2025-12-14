# Engineering Coding Standards

## 1. General Principles
- **Clarity over Cleverness:** Write code that is easy to read.
- **Strict Typing:** No `any`. Define interfaces for all data structures.
- **Composability:** Break large components into smaller, reusable atoms.

## 2. React Guidelines
- **Hooks:** Ensure dependencies in `useEffect` and `useCallback` are exhaustive.
- **Naming:**
  - Components: PascalCase (`PropertiesPanel.tsx`)
  - Utilities: camelCase (`treeHelpers.ts`)
  - Types: PascalCase (`types.ts`)
- **Project Structure:**
  - `components/`: UI logic.
  - `services/`: API interactions.
  - `utils/`: Pure helper functions.
  - `hooks/`: Reusable state logic.

## 3. Tailwind CSS
- Do not use `@apply` in CSS files unless absolutely necessary for global resets.
- Group styling logic: layout -> spacing -> visual -> interaction.
- Use the `glass-panel` utility class for consistency across panels.

## 4. Error Handling
- Use `try/catch` blocks in all Async/Await functions in Services.
- UI components should fail gracefully (render `null` or an Error State) rather than crashing the app.
- Use `console.error` for debugging, but ensure critical errors bubble up to the UI notification system.

## 5. Comments
- **JSDoc:** Required for all exported utility functions.
- **Inline:** Required for complex regex or math logic.
