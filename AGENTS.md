# AGENTS.md

> **Attention AI Agents:** This file is your primary directive for working within the Aether Architect repository. Strictly adhere to these rules, styles, and workflows.

## 1. Project Overview
**Aether Architect** is an enterprise-grade AI interface builder utilizing the Gemini 2.0 Flash/Pro models to generate production-ready React UI components from natural language. It is a frontend-heavy application built with React 19, Tailwind CSS, and the `@google/genai` SDK.

### Core Architecture
- **Framework:** React 19 (Functional Components, Hooks).
- **Styling:** Tailwind CSS (Utility-first, no CSS modules, custom `tailwind.config` injection).
- **Icons:** `lucide-react` (Do not use FontAwesome or others).
- **AI Integration:** Google Gemini API (`@google/genai`). **Strictly** use `GoogleGenAI` and `ai.models.generateContent`. Do NOT use `GoogleGenerativeAI` or deprecated methods.
- **State Management:** React Context / Local State (Keep it simple, lift state when necessary).

## 2. Technical Stack & Environment
- **Language:** TypeScript (`.tsx`, `.ts`). Strict typing is mandatory. Avoid `any` unless dealing with raw, unpredictable JSON from external APIs.
- **Build Tool:** Vite (implied environment).
- **Package Manager:** npm.

## 3. Operational Commands
- **Install:** `npm install`
- **Dev Server:** `npm start`
- **Build:** `npm run build`
- **Test:** `npm test` (Ensure unit tests are placed in `__tests__` or adjacent `.test.tsx` files).

## 4. Coding Standards

### React Components
- **Functional only.** No Class components.
- **Props:** Define strict Interfaces for props. Destructure props in the function signature.
- **Hooks:** Use built-in hooks (`useState`, `useEffect`, `useCallback`). Custom hooks go in `hooks/` folder if created.
- **Export:** Use `export default` for page-level components, `export const` for utilities/types.

### Styling (Tailwind)
- **Arbitrary Values:** Use sparingly (e.g., `w-[350px]`). Prefer theme values (`w-96`).
- **Organization:** Order classes logically: Layout -> Box Model -> Typography -> Visuals -> Interaction.
- **Premium Aesthetic:** Use `glass-panel`, `backdrop-blur`, and strictly adhere to the `obsidian`, `charcoal`, and `cyan/blue` color palette defined in `index.html`.

### AI SDK Usage Rules
- **Import:** `import { GoogleGenAI } from "@google/genai";`
- **Initialization:** `const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });`
- **Models:**
  - Logic/Reasoning: `gemini-3-pro-preview`
  - Speed/Chat: `gemini-2.5-flash`
  - Images: `gemini-3-pro-image-preview`
- **Deprecations:** NEVER use `google.generativeai`.

## 5. Workflow & Git
- **Commit Messages:** Conventional Commits format.
  - `feat: add new properties panel`
  - `fix: resolve canvas rendering issue`
  - `docs: update AGENTS.md`
- **Refactoring:** Do not delete existing business logic without explicit instruction. Deprecate first.
- **Files:**
  - Do not modify `index.html` unless changing global meta tags or CDN imports.
  - Do not modify `types.ts` unless adding new data structures supported by the backend.

## 6. Security Boundaries
- **API Keys:** NEVER hardcode API keys. Always use `process.env.API_KEY`.
- **Validation:** Sanitize all AI-generated HTML/Code before rendering (handled via `ArtifactRenderer`).
- **Data:** Do not send PII to the AI models.

## 7. Dos and Don'ts
- **DO:** Add comments for complex logic, especially inside `services/gemini.ts`.
- **DO:** Use `lucide-react` for all iconography.
- **DON'T:** Create new CSS files. Use Tailwind.
- **DON'T:** Use `useEffect` for data fetching without cleanup or cancellation handling.
- **DON'T:** Hallucinate imports. Verify they exist in `package.json` or the import map.

---
*End of Directive.*
