
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Cpu, Cloud, Lock, Unlock, X, Check, AlertCircle } from 'lucide-react';
import { getAIProvider, setAIProvider } from '../services/gemini';
import { AIProvider } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PIN_CODE = '6728';

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState<AIProvider>('cloud');
  const [nativeAvailable, setNativeAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
        setProvider(getAIProvider());
        // Check for native support
        if ((window as any).ai) {
            setNativeAvailable(true);
        }
    } else {
        // Reset state when closed
        if(!isUnlocked) {
            setPin('');
            setError('');
        }
    }
  }, [isOpen]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setError(''); // Clear error on type
    if (val.length <= 4) setPin(val);
    if (val === PIN_CODE) {
        setIsUnlocked(true);
    } else if (val.length === 4) {
        setError('Access Denied');
    }
  };

  const handleToggle = (newProvider: AIProvider) => {
    setProvider(newProvider);
    setAIProvider(newProvider);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn" role="dialog" aria-labelledby="admin-title">
      <div className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-red-500/20 bg-red-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert className="w-5 h-5" />
                <span id="admin-title" className="font-mono font-bold tracking-widest text-sm">ADMIN CONSOLE</span>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white" aria-label="Close Admin Console">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-8 flex flex-col items-center gap-6">
            
            {!isUnlocked ? (
                <>
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Lock className="w-8 h-8 text-slate-500" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-white font-bold mb-1">Restricted Access</h3>
                        <p className="text-xs text-slate-500 font-mono">ENTER SECURITY OVERRIDE</p>
                    </div>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={pin}
                            onChange={handlePinChange}
                            className={`bg-black border rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:outline-none w-48 font-mono transition-colors ${error ? 'border-red-500 text-red-500' : 'border-slate-700 focus:border-red-500'}`}
                            placeholder="••••"
                            autoFocus
                            aria-label="Enter Admin PIN"
                            aria-invalid={!!error}
                            aria-describedby="pin-error"
                        />
                        {/* Live region for validation errors */}
                        <div id="pin-error" role="alert" aria-live="polite" className="absolute -bottom-6 w-full text-center">
                            {error && (
                                <span className="text-xs text-red-500 font-bold flex items-center justify-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {error}
                                </span>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-16 h-16 rounded-full bg-green-900/20 flex items-center justify-center border border-green-500/30">
                        <Unlock className="w-8 h-8 text-green-500" />
                    </div>
                    
                    <div className="w-full space-y-6">
                        <div className="text-center">
                            <h3 className="text-white font-bold text-lg">Neural Bridge Config</h3>
                            <p className="text-xs text-slate-400 font-mono mt-1">SELECT EXECUTION PROVIDER</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => handleToggle('cloud')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${provider === 'cloud' ? 'bg-cyan-950/30 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                                aria-pressed={provider === 'cloud'}
                            >
                                <Cloud className="w-8 h-8" />
                                <span className="text-xs font-bold tracking-widest">GEMINI CLOUD</span>
                                {provider === 'cloud' && <Check className="w-4 h-4" />}
                            </button>

                            <button 
                                onClick={() => handleToggle('native')}
                                disabled={!nativeAvailable}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${provider === 'native' ? 'bg-purple-950/30 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800'} ${!nativeAvailable && 'opacity-50 cursor-not-allowed'}`}
                                aria-pressed={provider === 'native'}
                                aria-label={!nativeAvailable ? "Native Cortex (Offline)" : "Native Cortex"}
                            >
                                <Cpu className="w-8 h-8" />
                                <span className="text-xs font-bold tracking-widest">NATIVE CORTEX</span>
                                {!nativeAvailable ? <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded">OFFLINE</span> : (provider === 'native' && <Check className="w-4 h-4" />)}
                            </button>
                        </div>

                        {provider === 'native' && (
                             <div role="note" className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] text-purple-300 font-mono leading-relaxed">
                                WARNING: Native execution relies on local Chrome Gemini Nano. Complex PRDs may be truncated. Ensure chrome://flags/#optimization-guide-on-device-model is ENABLED.
                             </div>
                        )}
                    </div>
                </>
            )}

        </div>
      </div>
    </div>
  );
};

export default AdminModal;
