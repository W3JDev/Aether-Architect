
import React, { useState } from 'react';
import { Image, Video, Wand2, X, Download, Loader2, Sparkles, Beaker, Copy, Check, Link } from 'lucide-react';
import { generateImageAsset, generateVideoAsset, editImageAsset, analyzeUIDesign } from '../services/gemini';
import { GeneratedAsset, DesignCritique, StyleVariant } from '../types';

interface CreativeStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreativeStudio: React.FC<CreativeStudioProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'imagine' | 'remix' | 'motion' | 'alchemy'>('imagine');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Imagine Options
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [size, setSize] = useState('1K');

  // Alchemy State
  const [critique, setCritique] = useState<DesignCritique | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<StyleVariant | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (activeTab === 'alchemy') {
         if(!selectedImage) return;
         setIsProcessing(true);
         try {
             const result = await analyzeUIDesign(selectedImage);
             setCritique(result);
         } catch(e) {
             console.error(e);
             alert('Alchemy analysis failed. Try a smaller image.');
         } finally {
             setIsProcessing(false);
         }
         return;
    }

    if (!prompt) return;
    setIsProcessing(true);
    try {
        let url = '';
        if (activeTab === 'imagine') {
            url = await generateImageAsset(prompt, aspectRatio, size);
        } else if (activeTab === 'remix' && selectedImage) {
            url = await editImageAsset(selectedImage, prompt);
        } else if (activeTab === 'motion' && selectedImage) {
            url = await generateVideoAsset(selectedImage);
        }

        if (url) {
            setAssets(prev => [{
                id: crypto.randomUUID(),
                type: activeTab === 'motion' ? 'video' : 'image',
                url,
                prompt,
                timestamp: Date.now()
            }, ...prev]);
            
            // Auto select new image for next steps if valid
            if (activeTab === 'imagine') setSelectedImage(url);
        }
    } catch (e) {
        console.error(e);
        alert('Generation failed. Please try again.');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleVisualizeVariant = async (variant: StyleVariant) => {
      setIsProcessing(true);
      setSelectedVariant(variant);
      try {
          const url = await generateImageAsset(variant.visualPrompt, '16:9', '1K');
          setAssets(prev => [{
                id: crypto.randomUUID(),
                type: 'image',
                url,
                prompt: variant.name,
                timestamp: Date.now()
          }, ...prev]);
      } catch (e) {
          console.error(e);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (end) => {
            setSelectedImage(end.target?.result as string);
            setCritique(null); // Reset analysis on new upload
            setSelectedVariant(null);
        };
        reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const copyUrl = (id: string, url: string) => {
      navigator.clipboard.writeText(url);
      setCopiedUrlId(id);
      setTimeout(() => setCopiedUrlId(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-fadeIn">
        <div className="w-full max-w-7xl h-full max-h-[90vh] bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Controls */}
            <div className={`w-full ${activeTab === 'alchemy' ? 'md:w-[450px]' : 'md:w-96'} bg-slate-900/50 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto transition-all duration-300`}>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-pink-500" />
                        CREATIVE STUDIO
                    </h2>
                    <button onClick={onClose} className="md:hidden text-slate-400"><X /></button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-black rounded-xl border border-white/10 overflow-hidden">
                    <button onClick={() => setActiveTab('imagine')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'imagine' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>IMAGINE</button>
                    <button onClick={() => setActiveTab('remix')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'remix' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>REMIX</button>
                    <button onClick={() => setActiveTab('motion')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'motion' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>MOTION</button>
                    <button onClick={() => setActiveTab('alchemy')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'alchemy' ? 'bg-purple-900/40 text-purple-300' : 'text-slate-500 hover:text-slate-300'}`}>ALCHEMY</button>
                </div>

                <div className="space-y-4 flex-1">
                    {/* Dynamic Inputs based on Tab */}
                    {activeTab !== 'imagine' && (
                        <div className="p-4 border border-dashed border-slate-700 rounded-xl bg-slate-800/20 text-center relative">
                            {selectedImage ? (
                                <div className="relative group">
                                    <img src={selectedImage} alt="Reference" className="w-full h-32 object-cover rounded-lg" />
                                    <button onClick={() => { setSelectedImage(null); setCritique(null); }} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <label className="cursor-pointer block">
                                    <span className="text-xs text-slate-400 block mb-2">
                                        {activeTab === 'alchemy' ? 'Upload UI Screenshot to Audit' : 'Upload Reference Image'}
                                    </span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                    <div className="px-4 py-2 bg-slate-800 rounded-lg text-xs text-white hover:bg-slate-700 transition-colors inline-block">Choose File</div>
                                </label>
                            )}
                        </div>
                    )}

                    {(activeTab !== 'motion' && activeTab !== 'alchemy') && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-2 block">PROMPT</label>
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full bg-black border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500 h-32 resize-none"
                                placeholder={activeTab === 'imagine' ? "A futuristic city with flying cars..." : "Add a neon glow effect..."}
                            />
                        </div>
                    )}

                    {activeTab === 'imagine' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-2 block">ASPECT RATIO</label>
                                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-black border border-slate-700 rounded-lg p-2 text-xs text-white">
                                    <option value="1:1">1:1 (Square)</option>
                                    <option value="16:9">16:9 (Landscape)</option>
                                    <option value="9:16">9:16 (Portrait)</option>
                                    <option value="4:3">4:3 (Classic)</option>
                                    <option value="21:9">21:9 (Ultrawide)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-2 block">SIZE</label>
                                <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full bg-black border border-slate-700 rounded-lg p-2 text-xs text-white">
                                    <option value="1K">1K</option>
                                    <option value="2K">2K (High)</option>
                                    <option value="4K">4K (Ultra)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ALCHEMY RESULTS VIEW IN SIDEBAR */}
                    {activeTab === 'alchemy' && critique && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-400">DESIGN SCORE</span>
                                    <span className={`text-xl font-bold ${critique.score > 80 ? 'text-green-400' : critique.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>{critique.score}/100</span>
                                </div>
                                <p className="text-[10px] text-slate-300 leading-relaxed border-t border-white/5 pt-2">
                                    {critique.analysis}
                                </p>
                            </div>
                            
                            <h3 className="text-xs font-bold text-slate-500 mt-4">SUGGESTED EVOLUTIONS</h3>
                            <div className="space-y-2">
                                {critique.suggestions.map((variant, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleVisualizeVariant(variant)}
                                        className={`w-full p-3 rounded-lg border text-left transition-all ${selectedVariant?.name === variant.name ? 'bg-purple-900/20 border-purple-500 ring-1 ring-purple-500' : 'bg-black border-slate-800 hover:border-slate-600'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-sm text-white">{variant.name}</span>
                                            {selectedVariant?.name === variant.name && <Sparkles className="w-3 h-3 text-purple-400" />}
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{variant.description}</p>
                                        
                                        <div className="flex gap-1 mt-2">
                                            {variant.colorPalette.map(color => (
                                                <div key={color} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab !== 'alchemy' ? (
                        <button 
                            onClick={handleGenerate}
                            disabled={isProcessing || (!prompt && activeTab !== 'motion') || (!selectedImage && activeTab !== 'imagine')}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg shadow-purple-900/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                            {activeTab === 'imagine' ? 'GENERATE' : activeTab === 'remix' ? 'EDIT IMAGE' : 'ANIMATE'}
                        </button>
                    ) : (
                        !critique && (
                            <button 
                                onClick={handleGenerate}
                                disabled={isProcessing || !selectedImage}
                                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Beaker className="w-5 h-5" />}
                                AUDIT & EVOLVE
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Gallery / Preview Area */}
            <div className="flex-1 bg-black p-6 relative flex flex-col min-h-0">
                 <button onClick={onClose} className="absolute top-6 right-6 z-10 hidden md:block text-slate-500 hover:text-white bg-black/50 p-2 rounded-full"><X /></button>
                 
                 <div className="flex-1 overflow-y-auto pr-2">
                    {/* Alchemy specific view */}
                    {activeTab === 'alchemy' && selectedVariant ? (
                         <div className="h-full flex flex-col gap-6 animate-fadeIn">
                             <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 relative">
                                 <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                     <Sparkles className="text-purple-400 w-5 h-5" />
                                     Evolved: {selectedVariant.name}
                                 </h3>
                                 <p className="text-slate-400 mb-6 text-sm">{selectedVariant.description}</p>
                                 
                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                     {/* Visualization */}
                                     <div>
                                         <h4 className="text-xs font-bold text-slate-500 mb-2">VISUALIZATION</h4>
                                         {assets.find(a => a.prompt === selectedVariant.name) ? (
                                             <img src={assets.find(a => a.prompt === selectedVariant.name)?.url} className="w-full rounded-lg shadow-2xl border border-white/10" alt="Generated Variant" />
                                         ) : (
                                             <div className="aspect-video bg-black rounded-lg border border-dashed border-slate-700 flex items-center justify-center">
                                                 {isProcessing ? <Loader2 className="w-8 h-8 animate-spin text-purple-500" /> : <span className="text-xs text-slate-500">Visualizing...</span>}
                                             </div>
                                         )}
                                     </div>

                                     {/* Master Prompt Code */}
                                     <div className="flex flex-col h-full">
                                         <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-bold text-slate-500">MASTER BUILD PROMPT</h4>
                                            <button onClick={() => copyToClipboard(selectedVariant.codePrompt)} className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300">
                                                {copiedPrompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                {copiedPrompt ? 'COPIED' : 'COPY'}
                                            </button>
                                         </div>
                                         <textarea 
                                            readOnly 
                                            value={selectedVariant.codePrompt}
                                            className="flex-1 bg-black/50 border border-white/10 rounded-lg p-3 text-xs font-mono text-slate-300 resize-none focus:outline-none"
                                         />
                                         <p className="text-[10px] text-slate-500 mt-2">
                                             <span className="text-cyan-400 font-bold">TIP:</span> Copy this prompt and paste it into the main Aether chat to build this exact App.
                                         </p>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    ) : (
                        // Standard Gallery View
                        <>
                            <h3 className="text-xs font-bold text-slate-500 mb-4 sticky top-0 bg-black py-2 z-10">RECENT ASSETS</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {assets.map((asset) => (
                                    <div key={asset.id} className="group relative rounded-xl overflow-hidden border border-white/10 bg-slate-900">
                                        {asset.type === 'video' ? (
                                            <video src={asset.url} autoPlay loop muted className="w-full h-48 object-cover" />
                                        ) : (
                                            <img src={asset.url} alt="Asset" className="w-full h-48 object-cover" />
                                        )}
                                        
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <a href={asset.url} download={`asset-${asset.id}.${asset.type === 'video' ? 'mp4' : 'png'}`} className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform" title="Download">
                                                <Download className="w-4 h-4" />
                                            </a>
                                            <button onClick={() => copyUrl(asset.id, asset.url)} className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform" title="Copy URL">
                                                {copiedUrlId === asset.id ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                                            </button>
                                            {asset.type === 'image' && (
                                                <button onClick={() => { setActiveTab('motion'); setSelectedImage(asset.url); }} className="p-2 bg-purple-500 text-white rounded-full hover:scale-110 transition-transform" title="Animate this">
                                                    <Video className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="p-2 text-[10px] text-slate-500 truncate">{asset.prompt || 'Animated Video'}</div>
                                    </div>
                                ))}
                                {assets.length === 0 && (
                                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-2xl">
                                        <Image className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="text-sm">No assets generated yet.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                 </div>
            </div>

        </div>
    </div>
  );
};

export default CreativeStudio;
