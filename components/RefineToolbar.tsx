import React, { useState } from 'react';
import { Send, Sparkles, X } from 'lucide-react';

interface RefineToolbarProps {
  onRefine: (prompt: string) => void;
  isProcessing: boolean;
}

const RefineToolbar: React.FC<RefineToolbarProps> = ({ onRefine, isProcessing }) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onRefine(input);
      setInput('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 z-50 bg-cyan-500 text-black p-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-110 transition-transform flex items-center gap-2 font-bold"
          >
            <Sparkles className="w-5 h-5" />
            <span className="hidden md:inline">Refine / Edit</span>
          </button>
      );
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-50 animate-slideUp">
        <div className="bg-black/90 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl relative">
            <button 
                onClick={() => setIsOpen(false)}
                className="absolute -top-3 -right-3 bg-slate-800 text-slate-400 p-1 rounded-full border border-slate-600 hover:text-white"
            >
                <X className="w-4 h-4" />
            </button>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe changes (e.g. 'Add a login form', 'Make header dark')..."
                    className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder-slate-500 font-light"
                    autoFocus
                    disabled={isProcessing}
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() || isProcessing}
                    className="bg-cyan-500 text-black p-3 rounded-xl font-bold hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    </div>
  );
};

export default RefineToolbar;