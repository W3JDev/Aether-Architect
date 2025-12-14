# Data Model & Contracts

## Core Entities

### 1. Artifact
The atomic unit of a generated project.
```typescript
interface Artifact {
  id: string;          // UUID
  prd: PRD;            // The Blueprint
  designSystem: DS;    // The DNA
  uiTree: UINode;      // The Skeleton
  reactCode: string;   // The Export
  readme: string;      // The Manual
  timestamp: number;
}
```

### 2. UINode (The Recursive Tree)
Represents a single DOM element.
```typescript
interface UINode {
  id: string;
  type: 'div' | 'button' | 'h1' ...;
  styles: string;      // Tailwind classes
  content?: string;    // Inner Text
  attributes?: Record<string, string>;
  children?: UINode[];
}
```

### 3. Design System
```typescript
interface DesignSystem {
  palette: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  borderRadius: string;
}
```

## API Contracts (Internal)
All interaction with the `Gemini Service` returns strictly typed JSON validated against the schemas defined in `services/gemini.ts`. We use "Schema Constrained Generation" to ensure the AI never outputs malformed JSON.
