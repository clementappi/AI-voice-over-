import React from 'react';
import { Mic, Loader2 } from 'lucide-react';

interface TopBarProps {
  onGenerateClick: () => void;
  isGenerating: boolean;
  activeTab: 'script' | 'profile' | 'studio' | 'takes';
  setActiveTab: (tab: 'script' | 'profile' | 'studio' | 'takes') => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onGenerateClick,
  isGenerating,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      {/* Zone 1: Brand Wordmark (Single text element in display face) */}
      <div className="flex items-baseline gap-3 shrink-0">
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 hover:text-white transition-colors"
        >
          Chronicle Voice Studio
        </a>
        <span className="hidden sm:inline text-xs text-slate-400 font-normal">
          Investigative Tech Documentary Suite
        </span>
      </div>

      {/* Zone 2: 4 clean single-line nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('script')}
          className={`hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'script' ? 'text-slate-100 border-b border-sky-400 pb-0.5' : ''
          }`}
        >
          Documentary Script
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'profile' ? 'text-slate-100 border-b border-sky-400 pb-0.5' : ''
          }`}
        >
          Voice Profile
        </button>
        <button
          onClick={() => setActiveTab('studio')}
          className={`hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'studio' ? 'text-slate-100 border-b border-sky-400 pb-0.5' : ''
          }`}
        >
          Playback Studio
        </button>
        <button
          onClick={() => setActiveTab('takes')}
          className={`hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'takes' ? 'text-slate-100 border-b border-sky-400 pb-0.5' : ''
          }`}
        >
          Takes Archive
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onGenerateClick}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:bg-slate-700 disabled:text-slate-400 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Synthesizing Take...</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              <span>Synthesize Narration</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
