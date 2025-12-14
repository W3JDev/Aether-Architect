import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Command, Palette, Zap, Mic, MicOff, Wand2, Loader2, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { enhanceUserPrompt } from '../services/gemini';

interface PromptInputProps {
  onSubmit: (prompt: string, vibe: string) => void;
  isProcessing: boolean;
}

const VIBES = [
  'Futuristic & Neon',
  'Clean SaaS',
  'Minimalist Swiss',
  'Dark Enterprise',
  'Glassmorphism',
  'Neo-Brutalist',
  'Retro Pixel',
];

const SUGGESTIONS = [
  "CRM Dashboard with Kanban",
  "AI Chat Interface",
  "Crypto Trading Platform",
  "E-commerce Product Page",
  "Travel Booking Flow"
];

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isProcessing }) => {
  const [input, setInput] = useState('');
  const [vibe, setVibe] = useState(VIBES[1]); // Default Clean SaaS
  const [isListening, setIsListening] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
            setIsListening(false);
        };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
    } else {
        recognitionRef.current.start();
        setIsListening(true);
    }
  };

  const handleEnhance = async () => {
    if (!input.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
        const enhanced = await enhanceUserPrompt(input);
        if (enhanced) setInput(enhanced);
    } catch (e) {
        console.error(e);
    } finally {
        setIsEnhancing(false);
    }
  };

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isProcessing) {
      onSubmit(input, vibe);
    }
  }, [input, isProcessing, onSubmit, vibe]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-3xl mx-auto relative z-20 font-sans group">
      
      {/* Outer Glow */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl opacity-0 transition-opacity duration-500 blur-xl group-hover:opacity-20 ${isFocused ? 'opacity-30' : ''}`}></div>
      
      <div className={`relative bg-[#0A0A0B] border transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl ${isFocused ? 'border-white/20 shadow-blue-900/20' : 'border-white/10'}`}>
        
        {/* Main Input Area */}
        <div className="p-2">
            <div className="relative flex flex-col">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isProcessing}
                    placeholder="Describe your interface vision..."
                    className="w-full bg-transparent border-none text-lg md:text-xl text-white placeholder-slate-600 focus:outline-none focus:ring-0 resize-none min-h-[64px] leading-relaxed py-4 px-4 font-light"
                    rows={1}
                />
                
                {/* Control Bar */}
                <div className="flex items-center justify-between px-2 pb-2 mt-2">
                    <div className="flex items-center gap-2">
                         {/* Vibe Selector */}
                        <div className="relative group/vibe">
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10">
                                <Palette className="w-3.5 h-3.5" />
                                <span>{vibe}</span>
                            </button>
                            {/* Hover Dropdown */}
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#0F0F10] border border-white/10 rounded-xl shadow-xl overflow-hidden hidden group-hover/vibe:block z-50">
                                {VIBES.map(v => (
                                    <button 
                                        key={v}
                                        onClick={() => setVibe(v)}
                                        className={`w-full text-left px-4 py-2 text-xs hover:bg-white/5 ${vibe === v ? 'text-blue-400' : 'text-slate-400'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Enhancement Tools */}
                         <button
                            type="button"
                            onClick={handleEnhance}
                            disabled={isEnhancing || !input.trim()}
                            className={`p-2 rounded-lg transition-all ${isEnhancing ? 'text-purple-400 bg-purple-500/10' : 'text-slate-500 hover:text-purple-400 hover:bg-white/5'}`}
                            title="AI Enhance"
                         >
                            {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                         </button>

                         {recognitionRef.current && (
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`p-2 rounded-lg transition-all ${isListening ? 'text-red-400 bg-red-500/10 animate-pulse' : 'text-slate-500 hover:text-red-400 hover:bg-white/5'}`}
                                title="Voice Input"
                            >
                                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={() => handleSubmit()}
                        disabled={!input.trim() || isProcessing}
                        className={`
                            group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300
                            ${!input.trim() || isProcessing 
                                ? 'bg-white/5 text-slate-600 cursor-not-allowed' 
                                : 'bg-white text-black hover:bg-blue-50 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]'}
                        `}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Building</span>
                            </>
                        ) : (
                            <>
                                <span>Generate</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>

        {/* Footer Suggestions */}
        <div className="bg-[#0F0F10] border-t border-white/5 px-4 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider shrink-0">Try:</span>
            {SUGGESTIONS.map((s) => (
                <button 
                    key={s} 
                    onClick={() => setInput(s)}
                    className="shrink-0 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap"
                >
                    {s}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PromptInput;