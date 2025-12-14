# PRD: Aether Architect Core (v3.0)

## 1. Objectives
- Deliver a seamless "Text-to-UI" experience.
- Support iterative refinement (chat-to-edit).
- Ensure 99.9% uptime on generation capabilities via graceful fallbacks.

## 2. User Flows

### Flow A: The Creation Loop
1. User lands on Hero Page.
2. User inputs high-level concept (e.g., "A dark mode crypto dashboard").
3. **Phase 1 (Planning):** System generates PRD.
4. **Phase 2 (Design):** System generates Design System (Colors, Fonts).
5. **Phase 3 (Build):** System streams the UI Tree generation.
6. **Phase 4 (Render):** React engine renders the UI Tree.
7. User downloads Code.

### Flow B: The Alchemy Loop (Audit)
1. User opens Creative Studio.
2. User uploads a screenshot of an existing app.
3. Gemini Vision analyzes the UI.
4. System outputs a Critique (Score, Weaknesses).
5. System suggests 3 alternative Design Styles.
6. User selects a style to re-generate the view.

## 3. Functional Requirements
- **FR-01:** Must allow voice input for prompts.
- **FR-02:** Must support mobile viewports for preview.
- **FR-03:** Must allow direct property editing of generated nodes (drag-and-drop, text edit).
- **FR-04:** Must secure Admin routes with a PIN.

## 4. Non-Functional Requirements
- **NFR-01:** Latency for initial render < 5s.
- **NFR-02:** Accessibility score of generated code > 90 (Lighthouse).
- **NFR-03:** Dark mode default for the IDE interface.
