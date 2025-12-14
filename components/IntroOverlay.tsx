
import React, { useState, useEffect } from 'react';
import { Layers, Palette, Box, ChevronRight, Zap, Github } from 'lucide-react';

const IntroOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1000); // Concept
    const timer2 = setTimeout(() => setStep(2), 2500); // Design
    const timer3 = setTimeout(() => setStep(3), 4000); // Build
    const timer4 = setTimeout(() => setStep(4), 5500); // Ready

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const handleStart = () => {
    setExiting(true);
    setTimeout(onComplete, 800); // Wait for exit animation
  };

  if (exiting && step === -1) return null;

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-1000 ${exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full px-6 flex flex-col items-center gap-12">
        
        {/* Title */}
        <div className={`transition-all duration-1000 flex flex-col items-center ${step >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
             <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white text-center mb-2">
                AETHER <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ARCHITECT</span>
             </h1>
             <p className="text-slate-500 text-center font-mono text-sm tracking-widest uppercase mb-4">
                System Initialization Sequence
             </p>
             
             {/* Branded Stamp */}
             <a 
               href="https://github.com/w3jdev" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity"
             >
                <span className="text-[10px] font-mono text-slate-500">MADE BY</span>
                <span className="text-xs font-bold tracking-widest text-cyan-400">W3JDEV</span>
                <Github className="w-3 h-3 text-cyan-400" />
             </a>
        </div>

        {/* Steps Visualization */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full justify-center">
            
            {/* Step 1: Concept */}
            <div className={`flex flex-col items-center gap-3 transition-all duration-700 ${step >= 1 ? 'opacity-100 scale-100' : 'opacity-20 scale-90 blur-sm'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 ${step >= 1 ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]' : 'border-slate-800 text-slate-700'}`}>
                    <Layers className="w-8 h-8" />
                </div>
                <div className="text-center">
                    <h3 className={`text-sm font-bold ${step >= 1 ? 'text-white' : 'text-slate-700'}`}>CONCEPT</h3>
                    <p className="text-[10px] text-slate-500 font-mono">PRD GENERATION</p>
                </div>
            </div>

            <ChevronRight className={`hidden md:block w-6 h-6 transition-all duration-500 ${step >= 2 ? 'text-cyan-800' : 'text-slate-900'}`} />

            {/* Step 2: Design */}
            <div className={`flex flex-col items-center gap-3 transition-all duration-700 delay-100 ${step >= 2 ? 'opacity-100 scale-100' : 'opacity-20 scale-90 blur-sm'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 ${step >= 2 ? 'bg-blue-950/50 border-blue-500 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'border-slate-800 text-slate-700'}`}>
                    <Palette className="w-8 h-8" />
                </div>
                <div className="text-center">
                    <h3 className={`text-sm font-bold ${step >= 2 ? 'text-white' : 'text-slate-700'}`}>DESIGN</h3>
                    <p className="text-[10px] text-slate-500 font-mono">SYSTEM & TOKENS</p>
                </div>
            </div>

            <ChevronRight className={`hidden md:block w-6 h-6 transition-all duration-500 ${step >= 3 ? 'text-cyan-800' : 'text-slate-900'}`} />

            {/* Step 3: Build */}
            <div className={`flex flex-col items-center gap-3 transition-all duration-700 delay-200 ${step >= 3 ? 'opacity-100 scale-100' : 'opacity-20 scale-90 blur-sm'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 ${step >= 3 ? 'bg-purple-950/50 border-purple-500 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'border-slate-800 text-slate-700'}`}>
                    <Box className="w-8 h-8" />
                </div>
                <div className="text-center">
                    <h3 className={`text-sm font-bold ${step >= 3 ? 'text-white' : 'text-slate-700'}`}>BUILD</h3>
                    <p className="text-[10px] text-slate-500 font-mono">REACT COMPONENT</p>
                </div>
            </div>

        </div>

        {/* Action Area */}
        <div className={`h-16 flex items-center justify-center transition-all duration-1000 ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <button 
                onClick={handleStart}
                className="group relative px-8 py-4 bg-white text-black font-bold tracking-widest text-sm rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.4)]"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-white to-cyan-400 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                    ENTER SYSTEM <Zap className="w-4 h-4 fill-black" />
                </span>
            </button>
        </div>

      </div>
      
      {/* Loading Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 transition-all duration-[5500ms] ease-linear" style={{ width: step >= 4 ? '100%' : '0%' }}></div>
    </div>
  );
};

export default IntroOverlay;
