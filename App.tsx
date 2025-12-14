import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PromptInput from './components/PromptInput';
import StageViewer from './components/StageViewer';
import ArtifactRenderer from './components/ArtifactRenderer';
import CodeView from './components/CodeView';
import PropertiesPanel from './components/PropertiesPanel';
import IntroOverlay from './components/IntroOverlay';
import RefineToolbar from './components/RefineToolbar';
// Lazy load heavy modals to improve initial bundle size and hydration
const AdminModal = lazy(() => import('./components/AdminModal'));
const CreativeStudio = lazy(() => import('./components/CreativeStudio'));

import { generatePRD, generateDesignSystem, generateUITree, generateReactCode, editUITree, generateReadme } from './services/gemini';
import { AppPhase, PRD, DesignSystem, UINode, Artifact } from './types';
import { Code, Eye, RefreshCw, Smartphone, Monitor, Download, Undo, Redo, MousePointer2, Sparkles, Plus, AlertTriangle, Box, Cpu, Zap, Layers, Globe, Palette, WifiOff, DownloadCloud } from 'lucide-react';
import { findNode, updateNodeInTree, moveNodeInTree, cloneTree } from './utils/treeHelpers';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  
  const [phase, setPhase] = useState<AppPhase>(AppPhase.IDLE);
  const [prd, setPrd] = useState<PRD | null>(null);
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const [partialTree, setPartialTree] = useState<UINode | null>(null);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [error, setError] = useState<string | null>(null);

  // Editor State
  const [history, setHistory] = useState<UINode[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTree, setEditedTree] = useState<UINode | null>(null);
  
  // Mobile & PWA State
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const checkMobile = () => {
        setIsMobileDevice(window.innerWidth < 768);
        if (window.innerWidth < 768) setViewport('mobile');
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Network Status Listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check for "shortcuts" URL params (PWA feature)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'studio') {
      setShowIntro(false);
      setShowStudio(true);
    }

    return () => {
        window.removeEventListener('resize', checkMobile);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  useEffect(() => {
    if (artifact && artifact.uiTree && !editedTree) {
      setEditedTree(cloneTree(artifact.uiTree));
      setHistory([cloneTree(artifact.uiTree)]);
      setHistoryIndex(0);
    }
  }, [artifact]);

  const addToHistory = (newTree: UINode) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newTree);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setEditedTree(newTree);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditedTree(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditedTree(history[historyIndex + 1]);
    }
  };

  const handleNodeUpdate = (id: string, updates: Partial<UINode>) => {
    if (!editedTree) return;
    const newTree = updateNodeInTree(editedTree, id, updates);
    addToHistory(newTree);
  };

  const handleNodeMove = (draggedId: string, targetId: string, position: 'inside' | 'before' | 'after') => {
    if (!editedTree) return;
    const newTree = moveNodeInTree(editedTree, draggedId, targetId, position);
    addToHistory(newTree);
  };

  const handleCreate = async (prompt: string, vibe: string) => {
    if (isOffline) {
      setError("AI Generation requires an active internet connection.");
      return;
    }
    try {
      setError(null);
      setPhase(AppPhase.PLANNING);
      setPrd(null);
      setDesignSystem(null);
      setPartialTree(null);
      setArtifact(null);
      setEditedTree(null);
      setHistory([]);
      setHistoryIndex(-1);
      setIsEditMode(false);

      const enhancedPrompt = `${prompt}. Design Vibe/Aesthetic: ${vibe}`;

      const generatedPRD = await generatePRD(enhancedPrompt);
      setPrd(generatedPRD);
      
      setPhase(AppPhase.DESIGNING);
      const generatedDesign = await generateDesignSystem(generatedPRD);
      setDesignSystem(generatedDesign);

      setPhase(AppPhase.BUILDING);
      const uiTree = await generateUITree(generatedPRD, generatedDesign, (previewNode) => {
        setPartialTree(previewNode);
      });
      
      const reactCode = await generateReactCode(generatedPRD, uiTree);
      const readme = await generateReadme(generatedPRD);

      const newArtifact: Artifact = {
        id: crypto.randomUUID(),
        prd: generatedPRD,
        designSystem: generatedDesign,
        uiTree: uiTree,
        reactCode: reactCode,
        readme: readme,
        timestamp: Date.now(),
      };

      setArtifact(newArtifact);
      setPhase(AppPhase.COMPLETE);

    } catch (err) {
      console.error(err);
      setError("An anomaly occurred in the neural architecture. Please retry.");
      setPhase(AppPhase.IDLE);
    }
  };

  const handleRegenerate = async () => {
    if (!prd || !designSystem) return;
    if (isOffline) {
        setError("AI Generation requires internet.");
        return;
    }
    setPhase(AppPhase.BUILDING);
    setPartialTree(null);
    setError(null);

    try {
        const uiTree = await generateUITree(prd, designSystem, (previewNode) => {
            setPartialTree(previewNode);
        });
        const reactCode = await generateReactCode(prd, uiTree);
        const readme = await generateReadme(prd);

        const newArtifact: Artifact = {
            id: crypto.randomUUID(),
            prd: prd,
            designSystem: designSystem,
            uiTree: uiTree,
            reactCode: reactCode,
            readme: readme,
            timestamp: Date.now(),
        };

        setArtifact(newArtifact);
        setEditedTree(cloneTree(uiTree));
        setHistory([cloneTree(uiTree)]);
        setHistoryIndex(0);
        setPhase(AppPhase.COMPLETE);
    } catch (err) {
        console.error(err);
        setError("Regeneration failed.");
        setPhase(AppPhase.COMPLETE);
    }
  };

  const handleRefine = async (prompt: string) => {
    if (!artifact || !prd || !designSystem || !editedTree) return;
    if (isOffline) {
        setError("Refinement requires internet.");
        return;
    }
    setPhase(AppPhase.REFINING);
    setError(null);
    setPartialTree(editedTree);

    try {
        const updatedTree = await editUITree(editedTree, prompt, prd, designSystem, (previewNode) => {
            setPartialTree(previewNode);
        });
        const reactCode = await generateReactCode(prd, updatedTree);

        const newArtifact: Artifact = {
            ...artifact,
            uiTree: updatedTree,
            reactCode: reactCode,
            timestamp: Date.now(),
        };

        setArtifact(newArtifact);
        addToHistory(cloneTree(updatedTree));
        setPhase(AppPhase.COMPLETE);
    } catch (err) {
        console.error(err);
        setError("Refinement failed.");
        setPhase(AppPhase.COMPLETE);
    }
  };

  const handleDownload = () => {
    if (!artifact) return;
    try {
        const blob = new Blob([artifact.reactCode], { type: 'text/typescript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GeneratedArtifact-${artifact.id.slice(0, 8)}.tsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Download failed", e);
    }
  };

  const selectedNode = (editedTree && selectedNodeId) ? findNode(editedTree, selectedNodeId) : null;

  return (
    <div className="min-h-screen bg-black text-slate-200 selection:bg-blue-500/30 font-sans pb-16 relative overflow-x-hidden">
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-purple-900/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      </div>

      {showIntro && <IntroOverlay onComplete={() => setShowIntro(false)} />}
      
      <Suspense fallback={null}>
        <AdminModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
        <CreativeStudio isOpen={showStudio} onClose={() => setShowStudio(false)} />
      </Suspense>
      
      <Header onOpenAdmin={() => setShowAdmin(true)} onOpenStudio={() => setShowStudio(true)} />

      {/* Network / PWA Status Indicators */}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 items-end">
          {isOffline && (
            <div className="bg-red-950/80 border border-red-500/30 text-red-200 px-4 py-2 rounded-full shadow-xl flex items-center gap-2 backdrop-blur-md animate-fade-in-up">
              <WifiOff className="w-3 h-3" />
              <span className="text-xs font-bold">OFFLINE</span>
            </div>
          )}
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 backdrop-blur-md animate-fade-in-up transition-all"
            >
              <DownloadCloud className="w-3 h-3" />
              <span className="text-xs font-bold">INSTALL APP</span>
            </button>
          )}
      </div>

      {error && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-red-950/80 border border-red-500/30 text-red-200 px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-fade-in-up backdrop-blur-md">
           <AlertTriangle className="w-4 h-4" />
           <span className="text-sm font-medium">{error}</span>
           <button onClick={() => setError(null)} className="ml-2 hover:bg-red-900/50 rounded-full p-1"><Plus className="w-4 h-4 rotate-45" /></button>
        </div>
      )}
      
      <main className="pt-32 px-4 md:px-8 max-w-[1400px] mx-auto relative z-10 min-h-screen flex flex-col">
        
        {/* LANDING PAGE STATE */}
        <section className={`transition-all duration-700 ease-in-out ${phase !== AppPhase.IDLE ? 'hidden' : 'block'}`}>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10">
            
            {/* Hero Text */}
            <div className="space-y-6 max-w-4xl animate-fade-in-up">
                <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9]">
                    Design at the <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-purple-600">Speed of Thought.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
                    The enterprise AI architect that transforms natural language into production-grade React interfaces.
                </p>
            </div>

            {/* Main Input */}
            <div className="w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <PromptInput onSubmit={handleCreate} isProcessing={false} />
            </div>

            {/* Social Proof / Trust Bar */}
            <div className="pt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <p className="text-xs font-semibold tracking-widest text-slate-600 uppercase mb-6">Powered By Next-Gen Infrastructure</p>
                <div className="flex items-center justify-center gap-8 md:gap-16 opacity-40 grayscale transition-all hover:grayscale-0">
                    <div className="flex items-center gap-2"><Box className="w-5 h-5" /><span className="font-bold">React</span></div>
                    <div className="flex items-center gap-2"><Layers className="w-5 h-5" /><span className="font-bold">Tailwind</span></div>
                    <div className="flex items-center gap-2"><Zap className="w-5 h-5" /><span className="font-bold">Gemini 2.0</span></div>
                    <div className="flex items-center gap-2"><Globe className="w-5 h-5" /><span className="font-bold">Vercel</span></div>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-20 text-left animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                {[
                    { icon: Cpu, title: "Intelligent PRDs", desc: "Automated requirements gathering and technical scoping." },
                    { icon: Palette, title: "Atomic Design", desc: "Cohesive design systems with typography and color tokens." },
                    { icon: Code, title: "Clean Code", desc: "Production-ready React + Tailwind output, ready to deploy." }
                ].map((feat, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                            <feat.icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* WORKSPACE STATE */}
        {(phase === AppPhase.PLANNING || phase === AppPhase.DESIGNING || phase === AppPhase.BUILDING) && (
          <div className="animate-fade-in-up">
            <StageViewer 
                phase={phase} 
                prd={prd} 
                designSystem={designSystem} 
                partialTree={partialTree}
            />
          </div>
        )}

        {phase === AppPhase.REFINING && partialTree && (
             <div className="glass-panel rounded-2xl overflow-hidden relative border border-blue-500/20 shadow-2xl animate-fade-in-up h-[calc(100vh-140px)]">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
                <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                        <span className="text-xs font-mono text-blue-400 tracking-wider">REFINING ARCHITECTURE...</span>
                    </div>
                </div>
                 <div className="w-full h-full overflow-auto bg-white/95 p-8 flex justify-center">
                    <div className="text-black min-h-full w-full max-w-4xl shadow-xl bg-white">
                       <ArtifactRenderer node={partialTree} />
                    </div>
                 </div>
             </div>
        )}

        {phase === AppPhase.COMPLETE && artifact && (
          <section className="animate-fade-in-up flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px]">
            <div className="flex-1 flex flex-col gap-4 relative">
                
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4 p-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setPhase(AppPhase.IDLE)} 
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
                        >
                            <Plus className="w-4 h-4" /> New
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button 
                            onClick={handleRegenerate}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            title="Regenerate"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex bg-black/50 rounded-lg p-1 border border-white/5">
                        <button 
                            onClick={() => setActiveTab('preview')}
                            className={`px-4 py-1.5 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${activeTab === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button 
                            onClick={() => setActiveTab('code')}
                            className={`px-4 py-1.5 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${activeTab === 'code' ? 'bg-zinc-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Code className="w-3.5 h-3.5" /> Code
                        </button>
                    </div>

                    {activeTab === 'preview' && (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => { setIsEditMode(!isEditMode); setSelectedNodeId(null); }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isEditMode ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                            >
                                <MousePointer2 className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Edit</span>
                            </button>
                            {!isMobileDevice && (
                                <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1 ml-2">
                                    <button onClick={() => setViewport('desktop')} className={`p-1.5 rounded ${viewport === 'desktop' ? 'text-white bg-white/10' : 'text-slate-500'}`}><Monitor className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => setViewport('mobile')} className={`p-1.5 rounded ${viewport === 'mobile' ? 'text-white bg-white/10' : 'text-slate-500'}`}><Smartphone className="w-3.5 h-3.5" /></button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-h-0 bg-[#0F0F10] border border-white/10 rounded-2xl overflow-hidden relative flex flex-col shadow-2xl">
                    {activeTab === 'preview' ? (
                    <>
                        {/* Browser Chrome */}
                        <div className="h-12 border-b border-white/5 bg-[#18181B] flex items-center px-4 gap-4 shrink-0">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#27272A] border border-white/5"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27272A] border border-white/5"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27272A] border border-white/5"></div>
                            </div>
                            <div className="flex-1 max-w-sm mx-auto h-7 bg-[#09090B] border border-white/5 rounded flex items-center justify-center text-[10px] text-slate-500 font-mono">
                                localhost:3000
                            </div>
                        </div>

                        <div className={`flex-1 bg-white transition-all duration-500 mx-auto relative ${viewport === 'mobile' || isMobileDevice ? 'w-[375px] my-8 rounded-[3rem] border-[8px] border-[#27272A] shadow-2xl overflow-hidden' : 'w-full'}`}>
                            <div className="w-full h-full overflow-y-auto bg-white text-black font-sans scroll-smooth">
                                {editedTree && (
                                    <ArtifactRenderer 
                                        node={editedTree} 
                                        selectedId={selectedNodeId}
                                        onSelect={isEditMode ? setSelectedNodeId : undefined}
                                        onMoveNode={isEditMode ? handleNodeMove : undefined}
                                    />
                                )}
                            </div>
                        </div>
                        
                        <RefineToolbar onRefine={handleRefine} isProcessing={phase === AppPhase.REFINING} />
                    </>
                    ) : (
                        <div className="h-full relative">
                            <div className="absolute top-4 right-4 z-10">
                                <button onClick={handleDownload} className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 shadow-lg" title="Download TSX">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                            <CodeView code={artifact.reactCode} readme={artifact.readme} />
                        </div>
                    )}
                </div>
            </div>

            {activeTab === 'preview' && isEditMode && selectedNode && (
                <div className="lg:w-80 shrink-0 absolute lg:static inset-0 lg:inset-auto z-50 lg:z-auto bg-black/80 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none flex justify-end">
                    <div className="bg-[#18181B] h-full w-80 lg:rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                        <PropertiesPanel 
                            node={selectedNode} 
                            onUpdate={handleNodeUpdate} 
                            onClose={() => setSelectedNodeId(null)}
                        />
                    </div>
                </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;