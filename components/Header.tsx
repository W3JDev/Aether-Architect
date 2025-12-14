import React from 'react';
import { Layers, Zap, Palette, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  onOpenStudio: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAdmin, onOpenStudio }) => {
  return (
    <div className="fixed top-6 left-0 w-full z-50 flex justify-center px-4 pointer-events-none">
        <header className="pointer-events-auto bg-black/50 backdrop-blur-xl border border-white/10 rounded-full pl-5 pr-2 py-2 flex items-center gap-8 shadow-2xl shadow-black/50 transition-all hover:border-white/20">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 bg-white rounded flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        <Layers className="text-black w-3 h-3 fill-black" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-white">
                        Aether<span className="text-slate-500 font-medium">Architect</span>
                    </span>
                </div>
                {/* w3jdev Stamp */}
                <a 
                    href="https://w3jdev.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[9px] text-slate-500 hover:text-cyan-400 font-mono tracking-wide uppercase transition-colors border-l border-white/10 pl-3 pt-0.5"
                >
                    by w3jdev
                </a>
            </div>

            {/* Nav Items (Desktop) */}
            <div className="hidden md:flex items-center gap-1">
                 <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">Product</button>
                 <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">Solutions</button>
                 <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">Pricing</button>
            </div>

            <div className="w-px h-4 bg-white/10 hidden md:block"></div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={onOpenStudio}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                >
                    <Palette className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-slate-200">Studio</span>
                </button>

                <button 
                    onClick={onOpenAdmin}
                    className="p-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                >
                    <Zap className="w-4 h-4" />
                </button>
            </div>
        </header>
    </div>
  );
};

export default Header;