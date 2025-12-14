import React, { useEffect, useState } from 'react';
import { UINode } from '../types';
import { Settings, Type, Layout, AlignLeft, Hash, Pilcrow } from 'lucide-react';

interface PropertiesPanelProps {
  node: UINode | null;
  onUpdate: (id: string, updates: Partial<UINode>) => void;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, onUpdate, onClose }) => {
  // Local state to handle input changes before committing
  const [localStyles, setLocalStyles] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [localType, setLocalType] = useState('');
  const [localTransform, setLocalTransform] = useState('normal-case');

  useEffect(() => {
    if (node) {
      setLocalStyles(node.styles || '');
      setLocalContent(node.content || '');
      setLocalType(node.type);
      
      // Determine current transform from styles
      const s = node.styles || '';
      if (s.includes('uppercase')) setLocalTransform('uppercase');
      else if (s.includes('lowercase')) setLocalTransform('lowercase');
      else if (s.includes('capitalize')) setLocalTransform('capitalize');
      else setLocalTransform('normal-case');
    }
  }, [node]);

  if (!node) return null;

  const handleStyleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setLocalStyles(newVal);
    onUpdate(node.id, { styles: newVal });

    // Sync transform dropdown if manual edit happens
    if (newVal.includes('uppercase')) setLocalTransform('uppercase');
    else if (newVal.includes('lowercase')) setLocalTransform('lowercase');
    else if (newVal.includes('capitalize')) setLocalTransform('capitalize');
    else setLocalTransform('normal-case');
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalContent(e.target.value);
    onUpdate(node.id, { content: e.target.value });
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Cast to any to accept the string, validation happens elsewhere or handled by UI
    const newType = e.target.value as any; 
    setLocalType(newType);
    onUpdate(node.id, { type: newType });
  };

  const handleTransformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTransform = e.target.value;
    setLocalTransform(newTransform);
    
    let currentStyles = localStyles;
    // Remove existing transform classes
    currentStyles = currentStyles.replace(/\b(uppercase|lowercase|capitalize|normal-case)\b/g, '').trim();
    // Add new one
    const updatedStyles = `${currentStyles} ${newTransform}`.trim();
    
    setLocalStyles(updatedStyles);
    onUpdate(node.id, { styles: updatedStyles });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-white/10 w-80 animate-slideRight">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400">
          <Settings className="w-4 h-4" />
          <span className="font-bold text-sm tracking-wide">PROPERTIES</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Node Info */}
        <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase flex items-center gap-2">
                <Hash className="w-3 h-3" /> Node ID
            </label>
            <div className="text-xs text-slate-400 font-mono truncate bg-black/20 p-2 rounded">
                {node.id}
            </div>
        </div>

        {/* Element Type */}
        <div className="space-y-2">
           <label className="text-xs font-mono text-slate-500 uppercase flex items-center gap-2">
                <Layout className="w-3 h-3" /> Element Type
            </label>
           <select 
              value={localType} 
              onChange={handleTypeChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
           >
              {['div', 'section', 'header', 'footer', 'button', 'h1', 'h2', 'h3', 'p', 'span', 'img', 'input', 'textarea', 'card'].map(t => (
                  <option key={t} value={t}>{t}</option>
              ))}
           </select>
        </div>

        {/* Content */}
        <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase flex items-center gap-2">
                <Type className="w-3 h-3" /> Text Content
            </label>
            <input 
                type="text" 
                value={localContent}
                onChange={handleContentChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                placeholder="No text content..."
            />
        </div>

        {/* Text Transform */}
        <div className="space-y-2">
           <label className="text-xs font-mono text-slate-500 uppercase flex items-center gap-2">
                <Pilcrow className="w-3 h-3" /> Text Transform
            </label>
           <select 
              value={localTransform} 
              onChange={handleTransformChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
           >
              <option value="normal-case">Normal</option>
              <option value="uppercase">Uppercase</option>
              <option value="lowercase">Lowercase</option>
              <option value="capitalize">Capitalize</option>
           </select>
        </div>

        {/* Tailwind Styles */}
        <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Tailwind Classes
            </label>
            <textarea 
                value={localStyles}
                onChange={handleStyleChange}
                className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-100 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                placeholder="e.g. flex flex-col items-center..."
            />
        </div>

        {/* Quick Actions / Attributes Placeholder */}
        <div className="p-3 rounded-lg bg-cyan-900/10 border border-cyan-500/20 text-xs text-cyan-400">
            <p className="mb-1 font-bold">Pro Tip:</p>
            You can use standard Tailwind classes. Changes apply instantly.
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;