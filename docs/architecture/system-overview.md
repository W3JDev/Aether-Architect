# System Architecture Overview

## Context Diagram
Aether Architect operates as a client-side Single Page Application (SPA) that orchestrates calls to the Google Gemini API. It acts as a "Compiler" that translates natural language into structured JSON, which is then hydrated into React components.

## Core Components

### 1. The Orchestrator (`App.tsx`)
- Manages the state machine (`AppPhase`).
- Coordinates data flow between the Prompt Input, Gemini Service, and the Renderer.

### 2. The Neural Bridge (`services/gemini.ts`)
- **Role:** Abstraction layer for all AI interactions.
- **Providers:**
  - `Cloud`: Uses `@google/genai` via HTTP.
  - `Native`: Uses Chrome's experimental `window.ai` (Nano model).
- **Functions:**
  - `generatePRD()`: Chain-of-thought prompting.
  - `generateUITree()`: Streams NDJSON to build the UI progressively.

### 3. The Recursive Renderer (`ArtifactRenderer.tsx`)
- **Role:** Hydrates the static `UINode` JSON tree into live React elements.
- **Security:** Sanitizes content.
- **Interactivity:** Handles Drag-and-Drop and Click-to-Edit events.

### 4. The Creative Studio
- Isolated module for asset generation.
- Handles heavy media blobs (Images/Videos).

## Data Flow
`User Prompt` -> `Gemini (Reasoning)` -> `PRD JSON` -> `Gemini (Design)` -> `Design System JSON` -> `Gemini (Coding)` -> `UI Tree JSON` -> `React Render`.

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite.
- **Styling:** Tailwind CSS.
- **AI:** Google Gemini Pro 3 / Flash 2.5.
- **State:** React Context + Hooks.
