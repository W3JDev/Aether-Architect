import React from 'react';
import { PRD, DesignSystem, AppPhase, UINode } from '../types';
import { FileText, Palette, Box, CheckCircle2, Loader2, Code2, MonitorPlay } from 'lucide-react';
import ArtifactRenderer from './ArtifactRenderer';

interface StageViewerProps {
  phase: AppPhase;
  prd: PRD | null;
  designSystem: DesignSystem | null;
  partialTree: UINode | null;
}

const StageViewer: React.FC<StageViewerProps> = ({ phase, prd, designSystem, partialTree }) => {
  if (phase === AppPhase.IDLE) return null;

  const steps = [
    { id: AppPhase.PLANNING, icon: FileText, label: 'Blueprint' },
    { id: AppPhase.DESIGNING, icon: Palette, label: 'Design System' },
    { id: AppPhase.BUILDING, icon: Box, label: 'Construction' },
    { id: AppPhase.COMPLETE, icon: CheckCircle2, label: 'Deployed' },
  ];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
      {/* Progress Sidebar (Vertical on Desktop, Horizontal Scroll on Mobile) */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="glass-panel p-4 lg:p-6 rounded-2xl order-2 lg:order-1">
            <h3 className="hidden lg:block text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Processing Pipeline</h3>
            
            <div className="flex lg:flex-col items-center lg:items-start justify-between lg:justify-start gap-4 lg:gap-6 relative overflow-x-auto no-scrollbar">
                {/* Connecting Line (Desktop Only) */}
                <div className="hidden lg:block absolute left-4 top-2 bottom-2 w-0.5 bg-slate-800 -z-10"></div>
                
                {steps.map((step, idx) => {
                    const phaseOrder = [AppPhase.PLANNING, AppPhase.DESIGNING, AppPhase.BUILDING, AppPhase.COMPLETE];
                    const activeIdx = phaseOrder.indexOf(phase);
                    
                    const isCompleted = activeIdx > idx;
                    const isActive = activeIdx === idx;

                    return (
                        <div key={step.id} className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 min-w-[60px] lg:min-w-0 flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                                isCompleted ? 'bg-green-500 border-green-500 text-black' :
                                isActive ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.6)]' :
                                'bg-aether-900 border-slate-700 text-slate-700'
                            }`}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                                 isActive ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                 <step.icon className="w-4 h-4" />}
                            </div>
                            <div className="text-center lg:text-left">
                                <p className={`text-[10px] lg:text-sm font-bold ${isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {step.label}
                                </p>
                                {isActive && <p className="hidden lg:block text-xs text-cyan-400 animate-pulse">Processing...</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Design System Preview (Mini) - Hidden on very small screens if not relevant */}
        {designSystem && (
          <div className="glass-panel p-4 lg:p-6 rounded-2xl animate-float hidden lg:block order-1 lg:order-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Generated DNA</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                 <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg shadow-lg" style={{ backgroundColor: designSystem.palette.primary }} title="Primary" />
                 <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg shadow-lg" style={{ backgroundColor: designSystem.palette.secondary }} title="Secondary" />
                 <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg shadow-lg" style={{ backgroundColor: designSystem.palette.accent }} title="Accent" />
                 <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg shadow-lg border border-white/10" style={{ backgroundColor: designSystem.palette.surface }} title="Surface" />
              </div>
              <div className="text-xs text-slate-400 font-mono">
                <p>Heading: {designSystem.typography.headingFont}</p>
                <p>Body: {designSystem.typography.bodyFont}</p>
                <p>Radius: {designSystem.borderRadius}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area (PRD or Live Preview) */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* Live Construction View */}
        {phase === AppPhase.BUILDING && partialTree && (
           <div className="glass-panel rounded-2xl overflow-hidden relative border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] animate-fadeIn">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse-slow"></div>
              
              <div className="p-3 lg:p-4 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MonitorPlay className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span className="text-xs lg:text-sm font-mono text-cyan-400 tracking-wider">LIVE_CONSTRUCTION</span>
                </div>
                <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] lg:text-xs text-slate-500 font-mono hidden sm:inline">RECEIVING TELEMETRY</span>
                </div>
              </div>
              
              <div className="w-full bg-white h-[400px] lg:h-[600px] overflow-auto relative">
                <div className="absolute top-4 left-4 z-50 bg-black/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded font-mono border border-white/20">
                    ELEMENTS: {countNodes(partialTree)}
                </div>
                 {/* Provide a container for the light-themed artifacts */}
                 <div className="text-black min-h-full">
                    <ArtifactRenderer node={partialTree} />
                 </div>
              </div>
           </div>
        )}

        {/* PRD View */}
        {(phase === AppPhase.PLANNING || (phase === AppPhase.BUILDING && !partialTree)) && prd && (
          <div className="glass-panel p-6 lg:p-8 rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <FileText className="w-32 h-32" />
             </div>
             <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono mb-4 border border-cyan-500/20">
                    PRD-V1.0 GENERATED
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">{prd.title}</h2>
                <p className="text-base lg:text-lg text-slate-400 mb-6 italic">{prd.tagline}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-sm font-bold text-slate-300 uppercase mb-3">Overview</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">{prd.overview}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-300 uppercase mb-3">Key Features</h4>
                        <ul className="space-y-2">
                            {prd.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0"></span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper to count nodes for stats
const countNodes = (node: UINode): number => {
    let count = 1;
    if (node.children) {
        node.children.forEach(c => count += countNodes(c));
    }
    return count;
};

export default StageViewer;