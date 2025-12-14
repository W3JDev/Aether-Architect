import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PRD, DesignSystem, UINode, AIProvider, DesignCritique } from "../types";

const apiKey = process.env.API_KEY || '';

// --- CONFIGURATION STATE ---
let currentProvider: AIProvider = 'cloud';

export const setAIProvider = (provider: AIProvider) => {
    currentProvider = provider;
    console.log(`[Aether Core] Switched to ${provider.toUpperCase()} Neural Network.`);
};

export const getAIProvider = () => currentProvider;

// --- NATIVE AI HELPERS ---

const promptNative = async (systemPrompt: string, userPrompt: string): Promise<string> => {
    if (!(window as any).ai) {
        throw new Error("Native AI is not supported in this browser environment.");
    }
    
    try {
        const fullPrompt = `${systemPrompt}\n\nUSER REQUEST: ${userPrompt}\n\nIMPORTANT: Return ONLY valid JSON. No Markdown.`;
        
        const capabilities = await (window as any).ai.languageModel.capabilities();
        if (capabilities.available === 'no') {
             throw new Error("Native AI model is not available.");
        }

        const session = await (window as any).ai.languageModel.create({
            systemPrompt: "You are Aether, an advanced AI architect. You output strict JSON."
        });

        const result = await session.prompt(fullPrompt);
        return result.replace(/```json|```/g, '').trim();
    } catch (e) {
        console.error("Native AI Error:", e);
        throw new Error("Native AI processing failed. Ensure Chrome Flags are enabled.");
    }
};

// --- SCHEMA DEFINITIONS ---

const prdSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    tagline: { type: Type.STRING },
    overview: { type: Type.STRING },
    features: { type: Type.ARRAY, items: { type: Type.STRING } },
    targetAudience: { type: Type.STRING },
    technicalConstraints: { type: Type.STRING },
    appType: { 
        type: Type.STRING, 
        enum: ['landing_page', 'dashboard', 'mobile_app', 'form', 'portfolio', 'other'],
        description: "The type of application structure best suited for this request."
    }
  },
  required: ["title", "tagline", "overview", "features", "appType"],
};

const designSystemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    palette: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.STRING, description: "Hex code" },
        secondary: { type: Type.STRING, description: "Hex code" },
        background: { type: Type.STRING, description: "Hex code for main bg" },
        surface: { type: Type.STRING, description: "Hex code for cards/panels" },
        text: { type: Type.STRING, description: "Hex code for text" },
        accent: { type: Type.STRING, description: "Hex code for highlights" },
      },
      required: ["primary", "secondary", "background", "text", "accent", "surface"]
    },
    typography: {
      type: Type.OBJECT,
      properties: {
        headingFont: { type: Type.STRING, description: "Font family name" },
        bodyFont: { type: Type.STRING, description: "Font family name" },
      }
    },
    borderRadius: { type: Type.STRING, description: "Tailwind class" },
    spacingUnit: { type: Type.STRING, description: "Base spacing description" },
  },
  required: ["palette", "typography", "borderRadius"],
};

const critiqueSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER, description: "Design score out of 100" },
        analysis: { type: Type.STRING, description: "Brief analysis of current design" },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the style direction (e.g. 'Neo-Brutalist')" },
                    description: { type: Type.STRING, description: "Why this style works" },
                    visualPrompt: { type: Type.STRING, description: "Detailed prompt for Image Generation to visualize this" },
                    codePrompt: { type: Type.STRING, description: "Detailed text prompt for the Coding Agent to build this" },
                    colorPalette: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of 4-5 hex codes" }
                }
            }
        }
    }
};

// --- AGENT FUNCTIONS ---

export const generatePRD = async (prompt: string): Promise<PRD> => {
  const systemInstruction = `You are the LEAD PRODUCT ARCHITECT Agent.
  Your goal is to conceptualize a complete, production-ready digital product based on the user's request.
  
  Scope Capabilities:
  1. Full Marketing Landing Pages (Hero, Features, Pricing, Testimonials).
  2. Complex Dashboards (Sidebar, Header, Data Grid, Charts).
  3. Multi-Page Portfolios (Home, About, Projects, Contact).
  4. Mobile Native-Like Apps (Tab bar, Feed, Profile).
  5. Creative Tools (One-pagers, Form generators).

  Analyze this request: "${prompt}". 
  Return a PRD JSON.`;

  if (currentProvider === 'native') {
    const jsonStr = await promptNative(systemInstruction, prompt);
    return JSON.parse(jsonStr) as PRD;
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze Request: "${prompt}"`,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: prdSchema,
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate PRD");
  return JSON.parse(text) as PRD;
};

export const generateDesignSystem = async (prd: PRD): Promise<DesignSystem> => {
  const systemInstruction = `You are the HEAD OF DESIGN Agent.
  Based on the PRD, create a "Ultra High Quality" design system.
  Ensure high contrast, accessibility.
  
  Styles to consider based on PRD:
  - Glassmorphism (Backdrop blur, semi-transparent white/black)
  - 3D Jelly / Claymorphism (Soft shadows, rounded corners, pastel gradients)
  - Neo-Brutalism (Hard shadows, thick borders, bold colors)
  - Hyper-Realistic (Subtle gradients, metallic sheens)
  
  Return JSON.`;

  if (currentProvider === 'native') {
    const jsonStr = await promptNative(systemInstruction, JSON.stringify(prd));
    return JSON.parse(jsonStr) as DesignSystem;
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `PRD: ${JSON.stringify(prd)}`,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: designSystemSchema,
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate Design System");
  return JSON.parse(text) as DesignSystem;
};

// Helper to reconstruct tree from flat list
const buildTree = (flatNodes: any[]): UINode | null => {
  if (flatNodes.length === 0) return null;
  const nodeMap = new Map();
  let root: UINode | null = null;

  flatNodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [], parentId: undefined });
  });

  flatNodes.forEach(node => {
    const uiNode = nodeMap.get(node.id);
    if (node.parentId === null || node.parentId === "null" || !node.parentId) {
      root = uiNode;
    } else {
      const parent = nodeMap.get(node.parentId);
      if (parent) parent.children.push(uiNode);
    }
  });
  return root;
};

export const generateUITree = async (prd: PRD, designSystem: DesignSystem, onChunk?: (tree: UINode) => void): Promise<UINode> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const systemPrompt = `
    You are the MASTER FRONTEND ENGINEER Agent.
    Task: Generate a UI Tree for the application described.
    
    PRD: ${JSON.stringify(prd)}
    Design System: ${JSON.stringify(designSystem)}
    
    CAPABILITIES & STYLES:
    - Implement "Jelly UI" using: rounded-3xl, bg-white/70, backdrop-blur-2xl, border border-white/40, shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(255,255,255,0.5)].
    - Implement "Glassmorphism" using: bg-white/10, border-white/20, backdrop-blur-md, shadow-lg.
    - Implement "3D Buttons" using: shadow-[0_4px_0_rgb(0,0,0)], active:shadow-none, active:translate-y-1, transition-all.
    - Implement "Liquid Metal" using: bg-gradient-to-br from-slate-300 via-white to-slate-300, shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)].
    
    RULES:
    1. Use standard HTML tags.
    2. Use Tailwind CSS classes. Use 'arbitrary values' for complex shadows/gradients if needed.
    3. Structure: Root > Header, Main (with multiple sections), Footer.
    4. RESPONSIVE: Mobile-first.
    5. ACCESSIBILITY: 
       - Ensure all inputs have 'aria-label' or associated <label>.
       - Use role='alert' for validation message containers.
       - Use semantic tags (nav, main, aside, section).
       - Ensure sufficient color contrast.
    
    FORMATTING:
    - Return **NDJSON** (Newline Delimited JSON).
    - Node format: { "id": "uuid", "parentId": "uuid", "type": "string", "styles": "string", "content": "string", "attributes": {} }
    - Root first.
    - "content" MUST NOT contain raw code blocks.
    - Ensure 'card' elements in a grid have 'h-full' to match height.
  `;

  if (currentProvider === 'native') {
    const nativePrompt = `${systemPrompt}\n\nReturn a single JSON Array of nodes.`;
    const jsonStr = await promptNative("You are an expert UI Engineer.", nativePrompt);
    const nodes = JSON.parse(jsonStr);
    const tree = buildTree(nodes);
    if(!tree) throw new Error("Native generation failed");
    if(onChunk) onChunk(tree);
    return tree;
  }

  return streamTreeGeneration(ai, systemPrompt, onChunk);
};

export const editUITree = async (currentTree: UINode, updatePrompt: string, prd: PRD, designSystem: DesignSystem, onChunk?: (tree: UINode) => void): Promise<UINode> => {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `
      You are the CONTINUOUS INTEGRATION AGENT.
      Task: REBUILD the UI Tree based on the User's Request.
      
      CURRENT UI TREE (JSON):
      ${JSON.stringify(currentTree)}
      
      USER REQUEST: "${updatePrompt}"
      
      CONTEXT:
      PRD Title: ${prd.title}
      Design System: ${JSON.stringify(designSystem)}

      STYLES: Support "make it 3D", "add jelly effect", "more sleek", "restyle to swiss design".
      ACCESSIBILITY: Improve ARIA labels and semantic structure if missing.
      
      RULES:
      1. Return the **FULL** updated UI Tree in **NDJSON** format.
      2. Each line must be a FLAT node object: {"id": "...", "parentId": "...", "type": "...", "styles": "...", "content": "..."}
      3. The first node MUST be the Root (parentId: null).
      4. PRESERVE existing IDs for nodes that haven't changed.
      5. "content" must NOT contain raw code.
      6. Output the entire tree, not just the changed nodes.
      7. Ensure 'card' elements have 'h-full'.
    `;
    return streamTreeGeneration(ai, systemPrompt, onChunk);
};

// Common stream handler
const streamTreeGeneration = async (ai: GoogleGenAI, systemPrompt: string, onChunk?: (tree: UINode) => void): Promise<UINode> => {
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: systemPrompt,
    });
    
    let buffer = '';
    const flatNodes: any[] = [];
    let currentTree: UINode | null = null;
    
    for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
            buffer += text;
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('```')) continue;
                try {
                    const node = JSON.parse(trimmed);
                    if (node.id && node.type) {
                        flatNodes.push(node);
                        const tree = buildTree(flatNodes);
                        if (tree) {
                            currentTree = tree;
                            if (onChunk) onChunk(tree);
                        }
                    }
                } catch (e) {}
            }
        }
    }
    
    if (buffer.trim()) {
        try {
            const node = JSON.parse(buffer.trim());
            if (node.id) {
                flatNodes.push(node);
                currentTree = buildTree(flatNodes);
            }
        } catch (e) {}
    }
    
    if (!currentTree) throw new Error("Failed to generate UI Tree");
    return currentTree;
};

export const generateReactCode = async (prd: PRD, uiTree: UINode): Promise<string> => {
  const prompt = `
    Convert this UI JSON Tree into a React Functional Component (tsx).
    
    Style Guide:
    - Use Tailwind CSS.
    - Implement the exact styles from the JSON.
    - Ensure animations (animate-float, hover effects) are preserved.
    
    Accessibility & Validation:
    - If forms are present, implement basic validation logic (required fields).
    - Use state for inputs.
    - Show error messages using aria-live="polite".
    
    PRD Title: ${prd.title}
    UI Tree JSON: ${JSON.stringify(uiTree).substring(0, 15000)}... 
    
    Return ONLY code.
  `;

  if (currentProvider === 'native') return promptNative("React Expert", prompt);

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt });
  return response.text || "// Failed to generate code";
};

export const generateReadme = async (prd: PRD): Promise<string> => {
    if (currentProvider === 'native') return "# README\nGenerated by Native AI";

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Create a professional README.md for this project.
        PRD: ${JSON.stringify(prd)}
        Include: Project Title, Overview, Key Features, Tech Stack (React, Tailwind), and 'How to Deploy' section (mention Vercel/Netlify).
        Use Markdown.`
    });
    return response.text || "# README";
};

// --- CREATIVE STUDIO ASSET GENERATION ---

export const generateImageAsset = async (prompt: string, aspectRatio: string, size: string): Promise<string> => {
    if (currentProvider === 'native') throw new Error("Cloud required for Image Gen");
    
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
            imageConfig: { aspectRatio: aspectRatio as any, imageSize: size as any }
        }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated");
};

export const editImageAsset = async (base64Image: string, prompt: string): Promise<string> => {
     if (currentProvider === 'native') throw new Error("Cloud required for Image Edit");
     
     const ai = new GoogleGenAI({ apiKey });
     // Strip data prefix if present
     const data = base64Image.split(',')[1] || base64Image;
     
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/png', data } },
                { text: prompt }
            ]
        }
     });

     for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No edited image generated");
};

export const generateVideoAsset = async (base64Image: string): Promise<string> => {
    if (currentProvider === 'native') throw new Error("Cloud required for Video Gen");

    const ai = new GoogleGenAI({ apiKey });
    const data = base64Image.split(',')[1] || base64Image;

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        image: { imageBytes: data, mimeType: 'image/png' },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });

    while (!operation.done) {
        await new Promise(r => setTimeout(r, 5000));
        operation = await ai.operations.getVideosOperation({operation});
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) throw new Error("Video generation failed");
    
    // We need to fetch the bytes because the URI requires Auth
    const videoRes = await fetch(`${uri}&key=${apiKey}`);
    const blob = await videoRes.blob();
    return URL.createObjectURL(blob);
};

export const resolveMapLocation = async (query: string): Promise<{lat: number, lng: number} | null> => {
     if (currentProvider === 'native') return null;
     
     const ai = new GoogleGenAI({ apiKey });
     try {
         const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: `Find coordinates for: ${query}`,
             config: { tools: [{googleMaps: {}}] }
         });
         
         return null; 
     } catch (e) {
         return null;
     }
};

export const enhanceUserPrompt = async (rawInput: string): Promise<string> => {
    if (currentProvider === 'native') return rawInput; 
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `You are a Prompt Enhancer Agent.
    Task: Expand the user's simple app idea into a descriptive, high-quality prompt suitable for an AI Product Architect.
    
    RULES:
    1. Return ONLY the raw prompt text.
    2. Do NOT use Markdown (no bolding, no headers, no bullet points).
    3. Do NOT include conversational filler like "Here is the refined prompt".
    4. Write as a single, detailed, cohesive paragraph.
    5. Focus on functionality, user experience, and visual aesthetic.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Refine this idea: "${rawInput}"`,
      config: {
          systemInstruction: systemInstruction
      }
    });
    return response.text?.trim() || rawInput;
};

// --- ALCHEMY / UI AUDIT ---

export const analyzeUIDesign = async (base64Image: string): Promise<DesignCritique> => {
    if (currentProvider === 'native') throw new Error("Alchemy requires Cloud Intelligence");
    const ai = new GoogleGenAI({ apiKey });
    const data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Flash is great for vision analysis
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/png', data } },
                { text: `Analyze this UI screenshot. 
                  1. Give it a score /100. 
                  2. List 3 weaknesses. 
                  3. Suggest 3 RADICALLY different, professional style directions (variants) to improve it.
                  For each variant, provide a "codePrompt" (a long detailed prompt I can feed to an AI coder to build it) and a "visualPrompt" (to generate an image).` 
                }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: critiqueSchema
        }
    });
    
    const text = response.text;
    if (!text) throw new Error("Audit failed");
    return JSON.parse(text) as DesignCritique;
};
