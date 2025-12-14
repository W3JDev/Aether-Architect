# Internal API Specifications

## Gemini Service (`services/gemini.ts`)

### `generatePRD(prompt: string): Promise<PRD>`
Generates a structured Product Requirement Document.
- **Input:** Raw user string.
- **Output:** JSON object complying with `prdSchema`.
- **Model:** `gemini-3-pro-preview`.

### `generateUITree(prd: PRD, ds: DesignSystem): Promise<UINode>`
Generates the NDJSON stream for the UI.
- **Input:** PRD object, Design System object.
- **Output:** Root `UINode`.
- **Model:** `gemini-3-pro-preview` (Streamed).

### `analyzeUIDesign(base64: string): Promise<DesignCritique>`
Audits a UI screenshot.
- **Input:** Base64 image string.
- **Output:** JSON object with score, weaknesses, and variants.
- **Model:** `gemini-2.5-flash` (Vision).

## Artifact Renderer Props
```typescript
interface ArtifactRendererProps {
  node: UINode;
  selectedId?: string | null;
  onSelect?: (id: string) => void; // Enables edit mode
  onMoveNode?: (draggedId: string, targetId: string, position: 'inside' | 'before' | 'after') => void; // Enables DnD
}
```
