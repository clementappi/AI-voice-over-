import React, { useState } from 'react';
import { GeneratedAudioTake } from '../types/tts';
import { Play, Download, Trash2, Archive, CheckCircle2, FileAudio } from 'lucide-react';
import { formatTimecode, downloadWavFile, generateWavFilename } from '../utils/audioHelper';

interface TakesHistoryProps {
  takes: GeneratedAudioTake[];
  activeTakeId: string | null;
  onSelectTake: (take: GeneratedAudioTake) => void;
  onDeleteTake: (id: string) => void;
}

export const TakesHistory: React.FC<TakesHistoryProps> = ({
  takes,
  activeTakeId,
  onSelectTake,
  onDeleteTake,
}) => {
  const [downloadedName, setDownloadedName] = useState<string | null>(null);

  const handleDownloadTake = (take: GeneratedAudioTake) => {
    const chapterName = take.chapterTitle || take.title.split('[')[0].trim();
    const takeDate = take.createdAt ? new Date(take.createdAt) : new Date();
    const filename = generateWavFilename(chapterName, takeDate);
    downloadWavFile(take.audioUrl, filename);
    setDownloadedName(filename);
    setTimeout(() => {
      setDownloadedName(null);
    }, 5000);
  };

  const handleDownloadAll = () => {
    takes.forEach((take, index) => {
      setTimeout(() => {
        const chapterName = take.chapterTitle || take.title.split('[')[0].trim();
        const takeDate = take.createdAt ? new Date(take.createdAt) : new Date();
        const filename = generateWavFilename(chapterName, takeDate);
        downloadWavFile(take.audioUrl, filename);
      }, index * 400);
    });
    setDownloadedName(`Exported all ${takes.length} takes with chapter & timestamp naming.`);
    setTimeout(() => {
      setDownloadedName(null);
    }, 6000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
            <span>Session Archive</span>
            <span aria-hidden="true">·</span>
            <span>Takes & Audio Stems</span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-0.5">
            Recorded Narration Takes ({takes.length})
          </h3>
        </div>

        {takes.length > 0 && (
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Download All ({takes.length} WAVs)</span>
          </button>
        )}
      </div>

      {downloadedName && (
        <div className="mt-3 p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-lg flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{downloadedName}</span>
          </div>
          <button
            onClick={() => setDownloadedName(null)}
            className="text-emerald-400 hover:text-emerald-200 font-mono text-xs ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {takes.length === 0 ? (
        <div className="py-12 text-center">
          <Archive className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-400">No takes recorded in this session yet.</p>
          <p className="text-xs text-slate-500 mt-1">
            Synthesize chapters from the script editor to build your investigative documentary voiceover track.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60 mt-2">
          {takes.map((take) => {
            const isActive = take.id === activeTakeId;
            const chapterName = take.chapterTitle || take.title.split('[')[0].trim();
            const takeDate = take.createdAt ? new Date(take.createdAt) : new Date();
            const wavFilename = generateWavFilename(chapterName, takeDate);

            return (
              <div
                key={take.id}
                className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  isActive ? 'bg-sky-950/20 px-3 -mx-3 rounded-lg border border-sky-900/40' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-100 truncate">
                      {take.title}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      · {take.voiceName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                    &ldquo;{take.text}&rdquo;
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1.5 font-mono tabular-nums flex-wrap">
                    <span>{take.timestamp}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatTimecode(take.duration)}</span>
                    <span aria-hidden="true">·</span>
                    <span>24 kHz WAV</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-sky-400/90 flex items-center gap-1">
                      <FileAudio className="w-3 h-3" />
                      <span>{wavFilename}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectTake(take)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 bg-sky-950/50 hover:bg-sky-900/50 border border-sky-800/60 rounded-lg transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Load Take</span>
                  </button>

                  <button
                    onClick={() => handleDownloadTake(take)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    title={`Export ${wavFilename}`}
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden md:inline">Download</span>
                  </button>

                  <button
                    onClick={() => onDeleteTake(take.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-800/40 hover:bg-rose-950/40 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                    title="Delete Take"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
