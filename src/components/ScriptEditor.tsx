import React from 'react';
import { DocumentaryChapter } from '../types/tts';
import { FileText, Clock, Type, RotateCcw, Plus, Sparkles } from 'lucide-react';
import { estimateReadTime } from '../utils/audioHelper';

interface ScriptEditorProps {
  chapters: DocumentaryChapter[];
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
  currentText: string;
  onChangeText: (text: string) => void;
  onResetChapter: () => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  chapters,
  activeChapterId,
  onSelectChapter,
  currentText,
  onChangeText,
  onResetChapter,
}) => {
  const wordCount = currentText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = estimateReadTime(currentText);
  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  const insertCue = (cue: string) => {
    onChangeText(currentText + (currentText.endsWith(' ') ? '' : ' ') + cue + ' ');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 text-slate-200">
      {/* Chapter Navigation Tabs */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800/80 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
          {chapters.map((ch, index) => (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeChapterId === ch.id
                  ? 'bg-slate-800 text-sky-300 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              0{index + 1}. {ch.title.split(':')[1]?.trim() || ch.title}
            </button>
          ))}
          <button
            onClick={() => onSelectChapter('custom')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeChapterId === 'custom'
                ? 'bg-slate-800 text-sky-300 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Custom Narration
          </button>
        </div>

        {activeChapter && (
          <button
            onClick={onResetChapter}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Reset script to default chapter text"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chapter</span>
          </button>
        )}
      </div>

      {/* Chapter Overview Info */}
      <div className="pt-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            {activeChapter ? activeChapter.title : 'Custom Documentary Narration'}
          </h3>
          <p className="text-xs text-slate-400">
            {activeChapter ? activeChapter.subtitle : 'User-composed narration script'}
          </p>
        </div>

        {/* Clean unboxed metadata with typographic separators (anti-pill discipline) */}
        <div className="flex items-center gap-2 text-xs text-slate-400 tabular-nums">
          <span className="flex items-center gap-1">
            <Type className="w-3.5 h-3.5 text-slate-500" />
            <span>{wordCount} words</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>~{estimatedSeconds}s spoken run</span>
          </span>
        </div>
      </div>

      {/* Narration Textarea */}
      <div className="relative mt-2">
        <textarea
          value={currentText}
          onChange={(e) => onChangeText(e.target.value)}
          rows={7}
          className="w-full bg-slate-950/80 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg p-4 text-sm text-slate-100 leading-relaxed font-normal placeholder-slate-600 transition-colors resize-y"
          placeholder="Enter the documentary narration text here..."
        />
      </div>

      {/* Narrative Cues & Documentary Pacing Controls */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400">Narrator Cues:</span>
          <button
            onClick={() => insertCue('[pause 1.2s]')}
            className="px-2 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded border border-slate-700/80 transition-colors cursor-pointer"
          >
            + [pause 1.2s]
          </button>
          <button
            onClick={() => insertCue('[pause 0.6s]')}
            className="px-2 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded border border-slate-700/80 transition-colors cursor-pointer"
          >
            + [pause 0.6s]
          </button>
          <button
            onClick={() => insertCue('<breath>')}
            className="px-2 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded border border-slate-700/80 transition-colors cursor-pointer"
          >
            + &lt;breath&gt;
          </button>
          <button
            onClick={() => insertCue('...')}
            className="px-2 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded border border-slate-700/80 transition-colors cursor-pointer"
          >
            + Beat (...)
          </button>
        </div>

        <div className="text-slate-400 text-right">
          Cadence: <span className="text-slate-300">Measured 135 wpm</span>
        </div>
      </div>
    </div>
  );
};
