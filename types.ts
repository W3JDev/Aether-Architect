
export enum AppPhase {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING', // PRD generation
  DESIGNING = 'DESIGNING', // Design System generation
  BUILDING = 'BUILDING', // Component Tree generation
  REFINING = 'REFINING', // Iterative updates
  COMPLETE = 'COMPLETE'
}

export type AIProvider = 'cloud' | 'native';

export interface PRD {
  title: string;
  tagline: string;
  overview: string;
  features: string[];
  targetAudience: string;
  technicalConstraints: string;
  appType: 'landing_page' | 'dashboard' | 'mobile_app' | 'form' | 'portfolio' | 'other';
}

export interface DesignSystem {
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
  spacingUnit: string;
}

// A recursive structure to represent a UI Component Node
export interface UINode {
  id: string;
  type: 'div' | 'section' | 'header' | 'footer' | 'nav' | 'button' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'img' | 'input' | 'textarea' | 'card' | 'aside' | 'main' | 'ul' | 'li' | 'label' | 'select' | 'option' | 'iframe';
  styles: string; // Tailwind class string
  content?: string; // Text content
  attributes?: Record<string, string>; // e.g., src, placeholder, type
  children?: UINode[];
}

export interface Artifact {
  id: string;
  prd: PRD;
  designSystem: DesignSystem;
  uiTree: UINode;
  reactCode: string;
  readme: string; // Added Readme
  timestamp: number;
}

export interface GeneratedAsset {
    id: string;
    type: 'image' | 'video';
    url: string;
    prompt: string;
    timestamp: number;
}

// Alchemy Types
export interface StyleVariant {
    name: string;
    description: string;
    visualPrompt: string; // For Image Gen
    codePrompt: string; // For Main App
    colorPalette: string[];
}

export interface DesignCritique {
    score: number;
    analysis: string;
    weaknesses: string[];
    suggestions: StyleVariant[];
}
