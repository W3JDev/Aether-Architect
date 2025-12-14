
import React, { useState } from 'react';
import { Copy, Check, FileText, Code2, Rocket } from 'lucide-react';

interface CodeViewProps {
  code: string;
  readme: string;
}

const CodeView: React.FC<CodeViewProps> = ({ code, readme }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'react' | 'readme' | 'deploy'>('react');

  const handleCopy = () => {
    const text = activeTab === 'react' ? code : readme;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex gap-2 bg-slate-900 p-1 rounded-lg">
             <button onClick={() => setActiveTab('react')} className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 ${activeTab === 'react' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
                <Code2 className="w-3 h-3" /> React
             </button>
             <button onClick={() => setActiveTab('readme')} className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 ${activeTab === 'readme' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
                <FileText className="w-3 h-3" /> Readme
             </button>
             <button onClick={() => setActiveTab('deploy')} className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 ${activeTab === 'deploy' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
                <Rocket className="w-3 h-3" /> Deploy
             </button>
          </div>
          
          <button 
              onClick={handleCopy}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 flex items-center gap-2 text-xs"
          >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
          </button>
      </div>

      <div className="flex-1 overflow-auto bg-[#0d1117] rounded-xl border border-slate-800 p-4 font-mono text-sm leading-relaxed">
        {activeTab === 'react' && (
             <pre><code className="language-tsx text-slate-300">{code}</code></pre>
        )}
        {activeTab === 'readme' && (
             <pre><code className="text-slate-300 whitespace-pre-wrap">{readme}</code></pre>
        )}
        {activeTab === 'deploy' && (
             <div className="text-slate-300 space-y-4 font-sans">
                <h3 className="text-white font-bold text-lg border-b border-slate-700 pb-2">Deployment Guide</h3>
                
                <div>
                    <h4 className="font-bold text-cyan-400 mb-1">Option 1: Vercel (Recommended)</h4>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400 ml-2">
                        <li>Install Vercel CLI: <code>npm i -g vercel</code></li>
                        <li>Run <code>vercel</code> in your project directory.</li>
                    </ol>
                </div>

                <div>
                    <h4 className="font-bold text-cyan-400 mb-1">Option 2: Netlify</h4>
                     <p className="text-slate-400">Drag and drop your `build` folder to Netlify Drop.</p>
                </div>
                
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-xs text-yellow-400">Note: This is a preview. To deploy, download the code and set up a standard React environment (Vite/Create React App).</p>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default CodeView;
