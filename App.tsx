
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PromptInput from './components/PromptInput';
import StageViewer from './components/StageViewer';
import ArtifactRenderer from './components/ArtifactRenderer';
import CodeView from './components/CodeView';
import PropertiesPanel from './components/PropertiesPanel';
import IntroOverlay from './components/IntroOverlay';
import RefineToolbar from './components/RefineToolbar';
import AdminModal from './components/AdminModal';
import CreativeStudio from './components/CreativeStudio';
import { generatePRD, generateDesignSystem, generateUITree, generateReactCode, editUITree, generateReadme } from './services/gemini';
import { AppPhase, PRD, DesignSystem, UINode, Artifact } from './types';
import { Code, Eye, RefreshCw, Smartphone, Monitor, Download, Undo, Redo, MousePointer2, Sparkles, Plus } from 'lucide-react';
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
  
  // Mobile Detection
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
        setIsMobileDevice(window.innerWidth < 768);
        if (window.innerWidth < 768) setViewport('mobile');
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <div className="min-h-screen bg-obsidian text-slate-200 selection:bg-cyan-500/30 font-sans pb-16">
      
      {showIntro && <IntroOverlay onComplete={() => setShowIntro(false)} />}
      
      <AdminModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
      <CreativeStudio isOpen={showStudio} onClose={() => setShowStudio(false)} />
      
      <Header onOpenAdmin={() => setShowAdmin(true)} onOpenStudio={() => setShowStudio(true)} />
      
      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-[1600px] mx-auto space-y-6 md:space-y-12">
        <section className={`transition-all duration-700 ${phase !== AppPhase.IDLE ? 'scale-95 opacity-80 hidden' : 'scale-100'}`}>
          <div className="text-center mb-8 md:mb-12 space-y-4 pt-4">
            <h1 className="text-4xl md:text-8xl font-bold tracking-tight text-white mb-2 font-sans">
              AETHER <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ARCHITECT</span>
            </h1>
            <p className="text-sm md:text-xl text-slate-400 max-w-2xl mx-auto font-light px-4">
              The premium AI mastermind that turns abstract visions into production-grade UI artifacts.
            </p>
          </div>
          <PromptInput onSubmit={handleCreate} isProcessing={phase !== AppPhase.IDLE && phase !== AppPhase.COMPLETE} />
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center max-w-lg mx-auto text-sm">
                {error}
            </div>
          )}
        </section>

        {(phase === AppPhase.PLANNING || phase === AppPhase.DESIGNING || phase === AppPhase.BUILDING) && (
          <StageViewer 
            phase={phase} 
            prd={prd} 
            designSystem={designSystem} 
            partialTree={partialTree}
          />
        )}

        {phase === AppPhase.REFINING && partialTree && (
             <div className="glass-panel rounded-2xl overflow-hidden relative border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] animate-fadeIn h-[calc(100vh-140px)]">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse-slow"></div>
                <div className="p-3 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                        <span className="text-sm font-mono text-purple-400 tracking-wider">EVOLVING UI ARCHITECTURE...</span>
                    </div>
                </div>
                 <div className="w-full h-full overflow-auto bg-white p-4">
                    <div className="text-black min-h-full">
                       <ArtifactRenderer node={partialTree} />
                    </div>
                 </div>
             </div>
        )}

        {phase === AppPhase.COMPLETE && artifact && (
          <section className="animate-slideUp flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)]">
            <div className="flex-1 flex flex-col gap-4 relative">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar whitespace-nowrap px-1">
                    <div className="flex items-center gap-2 md:gap-4">
                        <button 
                            onClick={() => setPhase(AppPhase.IDLE)} 
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs md:text-sm"
                        >
                            <Plus className="w-4 h-4" /> <span className="hidden md:inline">New</span>
                        </button>
                        
                        <button 
                            onClick={handleRegenerate}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300 transition-all text-xs md:text-sm border border-transparent hover:border-cyan-500/30"
                        >
                            <RefreshCw className="w-4 h-4" /> <span className="hidden md:inline">Reset</span>
                        </button>

                        <div className="h-6 w-px bg-white/10"></div>
                        
                        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                            <button 
                                onClick={() => setActiveTab('preview')}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md flex items-center gap-2 text-xs md:text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Eye className="w-3 h-3 md:w-4 md:h-4" /> Preview
                            </button>
                            <button 
                                onClick={() => setActiveTab('code')}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md flex items-center gap-2 text-xs md:text-sm font-medium transition-all ${activeTab === 'code' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Code className="w-3 h-3 md:w-4 md:h-4" /> Code
                            </button>
                        </div>
                    </div>

                    {activeTab === 'preview' && (
                        <div className="flex items-center gap-4 pl-4">
                             <div className="flex items-center gap-1">
                                <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors" title="Undo">
                                    <Undo className="w-4 h-4" />
                                </button>
                                <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors" title="Redo">
                                    <Redo className="w-4 h-4" />
                                </button>
                             </div>

                             <div className="h-6 w-px bg-white/10"></div>
                             
                             <button 
                                onClick={() => { setIsEditMode(!isEditMode); setSelectedNodeId(null); }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all ${isEditMode ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                             >
                                <MousePointer2 className="w-3 h-3" />
                                <span className="hidden md:inline">{isEditMode ? 'Editing Active' : 'Enable Editing'}</span>
                             </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-h-0 glass-panel rounded-2xl p-2 relative flex flex-col">
                    {activeTab === 'preview' ? (
                    <>
                        <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 mb-2 shrink-0">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            </div>
                            
                            {!isMobileDevice && (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setViewport('desktop')} className={`p-1.5 rounded hover:bg-white/5 ${viewport === 'desktop' ? 'text-cyan-400' : 'text-slate-500'}`}>
                                        <Monitor className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setViewport('mobile')} className={`p-1.5 rounded hover:bg-white/5 ${viewport === 'mobile' ? 'text-cyan-400' : 'text-slate-500'}`}>
                                        <Smartphone className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={`flex-1 bg-white overflow-hidden transition-all duration-500 mx-auto shadow-2xl relative ${viewport === 'mobile' || isMobileDevice ? 'w-full lg:max-w-[375px] lg:rounded-2xl lg:my-4 lg:border-[8px] lg:border-slate-800' : 'w-full rounded-b-xl'}`}>
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
                        <div className="p-4 h-full overflow-hidden">
                            <div className="absolute top-4 right-4 z-10">
                                <button onClick={handleDownload} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white" title="Download TSX">
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
                    <div className="glass-panel h-full w-80 lg:rounded-2xl overflow-hidden shadow-2xl border-l border-white/20">
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
