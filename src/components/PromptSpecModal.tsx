import React, { useState } from 'react';
import { SKY_VIEW_MASTER_PROMPT } from '../data/promptSpec';
import { Copy, Check, FileCode, X, Sparkles, Terminal } from 'lucide-react';

interface PromptSpecModalProps {
  onClose: () => void;
}

export const PromptSpecModal: React.FC<PromptSpecModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SKY_VIEW_MASTER_PROMPT.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Airline Reservation Prompt & Architecture Spec</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Sky View Platform Spec
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The comprehensive master prompt and engineering blueprint for this airline reservation system.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                copied
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
              }`}
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Master Prompt'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="font-bold text-indigo-400 mb-1">1. Global Routing & Rewards</div>
              <p className="text-slate-300 text-[11px]">
                Prestige destination multipliers (1.1x to 1.65x), great-circle mileage calculations, and dynamic Sky Club loyalty points.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="font-bold text-emerald-400 mb-1">2. 4-Class Cabin & Flexibility</div>
              <p className="text-slate-300 text-[11px]">
                Economy, Premium Economy, Business Suite & First Class Suite with Standard, Flex, and SuperFlex (100% refundable) policies.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="font-bold text-amber-400 mb-1">3. Live Ops & Email Dispatch</div>
              <p className="text-slate-300 text-[11px]">
                Interactive aircraft seat matrix, real-time booking and cancellation refund calculations, and automated transactional email generation.
              </p>
            </div>
          </div>

          {/* Raw Prompt Terminal Display */}
          <div className="relative rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-5 font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap shadow-inner overflow-x-auto max-h-[480px]">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 text-slate-400 select-none">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>SKY_VIEW_PROMPT_SPECIFICATION.md</span>
            </div>
            {SKY_VIEW_MASTER_PROMPT.trim()}
          </div>
        </div>
      </div>
    </div>
  );
};
