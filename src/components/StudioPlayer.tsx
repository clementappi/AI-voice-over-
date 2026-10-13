import React, { useRef, useState, useEffect } from 'react';
import { GeneratedAudioTake } from '../types/tts';
import { formatTimecode, downloadWavFile, generateWavFilename } from '../utils/audioHelper';
import { AudioVisualizer } from './AudioVisualizer';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  FastForward,
  Rewind,
  Sparkles,
  CheckCircle2,
  FileAudio,
  HardDriveDownload,
  Info,
} from 'lucide-react';

interface StudioPlayerProps {
  currentTake: GeneratedAudioTake | null;
  scriptText: string;
  onQuickAudition: () => void;
  isGenerating: boolean;
  onExportSuccess?: (filename: string) => void;
}

export const StudioPlayer: React.FC<StudioPlayerProps> = ({
  currentTake,
  scriptText,
  onQuickAudition,
  isGenerating,
  onExportSuccess,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [downloadSuccessName, setDownloadSuccessName] = useState<string | null>(null);
  const [showExportDetails, setShowExportDetails] = useState(false);

  useEffect(() => {
    if (currentTake && audioRef.current) {
      audioRef.current.src = currentTake.audioUrl;
      audioRef.current.load();
      setCurrentTime(0);
      setIsPlaying(false);
      setDownloadSuccessName(null);
    }
  }, [currentTake]);

  const togglePlay = () => {
    if (!audioRef.current || !currentTake) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Audio playback error:', e);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || currentTake?.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Compute standard documentary WAV filename based on chapter title and timestamp
  const getComputedFilename = () => {
    if (!currentTake) return 'Documentary_Take.wav';
    const chapterName = currentTake.chapterTitle || currentTake.title.split('[')[0].trim();
    const takeDate = currentTake.createdAt ? new Date(currentTake.createdAt) : new Date();
    return generateWavFilename(chapterName, takeDate);
  };

  const handleDownload = () => {
    if (!currentTake) return;
    const filename = getComputedFilename();
    downloadWavFile(currentTake.audioUrl, filename);
    setDownloadSuccessName(filename);
    if (onExportSuccess) {
      onExportSuccess(filename);
    }
    setTimeout(() => {
      setDownloadSuccessName(null);
    }, 6000);
  };

  // Split text into paragraphs for synchronized teleprompter view
  const paragraphs = (currentTake?.text || scriptText)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Approximate which paragraph is currently spoken based on playback progress
  const progressPercent = duration > 0 ? currentTime / duration : 0;
  const activeParagraphIndex = Math.min(
    paragraphs.length - 1,
    Math.floor(progressPercent * paragraphs.length)
  );

  const estimatedFileSizeKb = currentTake
    ? Math.round(((currentTake.duration || 15) * 24000 * 2) / 1024)
    : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 text-slate-200">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
            <span>Playback Deck</span>
            <span aria-hidden="true">·</span>
            <span>Master Audio Monitor</span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-0.5">
            {currentTake ? currentTake.title : 'Documentary Take Monitor'}
          </h3>
        </div>

        {currentTake && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExportDetails(!showExportDetails)}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-colors cursor-pointer"
              title="View WAV Export Details"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors cursor-pointer shadow-sm"
              title={`Export as .wav: ${getComputedFilename()}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .WAV</span>
            </button>
          </div>
        )}
      </div>

      {/* Download Confirmation Toast / Alert */}
      {downloadSuccessName && (
        <div className="mt-3 p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-lg flex items-center justify-between gap-2 text-xs text-emerald-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span>Exported: </span>
              <span className="font-mono text-emerald-300">{downloadSuccessName}</span>
            </div>
          </div>
          <button
            onClick={() => setDownloadSuccessName(null)}
            className="text-emerald-400 hover:text-emerald-200 font-mono text-xs ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Export Info Drawer */}
      {showExportDetails && currentTake && (
        <div className="mt-3 p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <FileAudio className="w-3.5 h-3.5 text-sky-400" />
              <span>Documentary WAV Export Specification</span>
            </span>
            <span className="font-mono text-slate-400 text-[11px]">~{estimatedFileSizeKb} KB</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800/80 font-mono text-[11px] text-sky-300 break-all select-all">
            {getComputedFilename()}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1">
            <div>Format: <span className="text-slate-200">Broadcast WAV (RIFF)</span></div>
            <div>Sample Rate: <span className="text-slate-200">24,000 Hz</span></div>
            <div>Channels: <span className="text-slate-200">1 (Mono)</span></div>
            <div>Bit Depth: <span className="text-slate-200">16-Bit PCM</span></div>
          </div>
        </div>
      )}

      {/* Visualizer Frame */}
      <div className="my-5">
        <AudioVisualizer isPlaying={isPlaying} audioElement={audioRef.current} />
      </div>

      {/* Scrub Bar & Timecodes */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-400">
          <span>{formatTimecode(currentTime)}</span>
          <span>{formatTimecode(duration || (currentTake?.duration ?? 0))}</span>
        </div>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.01}
          value={currentTime}
          onChange={handleSeek}
          disabled={!currentTake}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 disabled:opacity-40"
        />
      </div>

      {/* Transport Controls */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSkip(-5)}
            disabled={!currentTake}
            className="p-2 text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
            title="Rewind 5 seconds"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentTake}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-sky-400 text-slate-950 hover:bg-sky-300 disabled:bg-slate-800 disabled:text-slate-600 transition-colors cursor-pointer shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={() => handleSkip(5)}
            disabled={!currentTake}
            className="p-2 text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
            title="Skip forward 5 seconds"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            disabled={!currentTake}
            className="p-2 text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed, Volume, and Direct Export */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Speed Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {[0.85, 1.0, 1.15].map((rate) => (
              <button
                key={rate}
                onClick={() => handleRateChange(rate)}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  playbackRate === rate ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* Quick Download Button in Transport Bar */}
          {currentTake && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-colors cursor-pointer"
              title={`Download .wav: ${getComputedFilename()}`}
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Teleprompter / Synchronized Narration Beats */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Documentary Narration Script Sync
          </span>
          {currentTake && (
            <span className="text-xs text-sky-400">
              Voice: {currentTake.voiceName}
            </span>
          )}
        </div>

        <div className="space-y-3 bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 max-h-48 overflow-y-auto">
          {paragraphs.map((para, idx) => {
            const isActive = isPlaying && idx === activeParagraphIndex;
            return (
              <p
                key={idx}
                className={`text-sm leading-relaxed transition-all ${
                  isActive
                    ? 'text-sky-200 font-medium bg-sky-950/40 p-2 rounded border border-sky-800/60'
                    : 'text-slate-300'
                }`}
              >
                {para}
              </p>
            );
          })}
        </div>
      </div>

      {/* Empty State Banner if no take generated yet */}
      {!currentTake && (
        <div className="mt-4 p-4 rounded-lg bg-sky-950/20 border border-sky-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-sky-300">
              No audio take loaded yet in the monitor.
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Click &quot;Synthesize Narration&quot; above or run a quick voice audition to preview the documentary tone.
            </p>
          </div>
          <button
            onClick={onQuickAudition}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-950 bg-sky-400 hover:bg-sky-300 rounded-lg whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Audition Voice Sample</span>
          </button>
        </div>
      )}
    </div>
  );
};
