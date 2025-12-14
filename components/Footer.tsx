import React from 'react';
import { Wifi, Cpu, Github, Command, Linkedin, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-40 bg-black/90 backdrop-blur-xl border-t border-white/5 h-10 flex items-center justify-between px-6 select-none text-[10px] text-slate-500 font-mono">
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-400">
           <Command className="w-3 h-3" />
           <span className="tracking-widest font-semibold">AETHER OS 3.0</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse"></div>
            <span>SYSTEM NORMAL</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
         <div className="flex items-center gap-4 border-l border-white/5 pl-6">
             <span className="hidden md:inline text-slate-600">© {new Date().getFullYear()} w3jdev</span>
             
             <a 
                href="https://w3jdev.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                title="w3jdev.com"
             >
                <Globe className="w-3 h-3" />
                <span className="hidden sm:inline">w3jdev.com</span>
             </a>

             <a 
                href="https://github.com/w3jdev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
                title="GitHub"
             >
                <Github className="w-3 h-3" />
             </a>

             <a 
                href="https://linkedin.com/in/w3jdev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                title="LinkedIn"
             >
                <Linkedin className="w-3 h-3" />
             </a>
         </div>
      </div>

    </footer>
  );
};

export default Footer;