import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioElement: HTMLAudioElement | null;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Dark background with faint studio grid lines
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);

      // Studio grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridGap = 24;
      for (let x = 0; x < width; x += gridGap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Center Baseline
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw Spectrum Bars (Broadcast 32-band analyzer)
      const numBars = 48;
      const barWidth = (width / numBars) - 2;

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + 2);
        let barHeight = 4;

        if (isPlaying) {
          // Voice-range spectral distribution (peaks in male fundamental 100-250Hz, lower in high kHz)
          const voiceWeight = Math.sin((i / numBars) * Math.PI);
          const timeVariance = Math.sin(phase * 4 + i * 0.3) * 0.5 + 0.5;
          const speechModulation = Math.sin(phase * 1.5) * 0.3 + 0.7;
          barHeight = 4 + (height * 0.75 * voiceWeight * timeVariance * speechModulation);
        }

        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#0284c7');
        gradient.addColorStop(0.7, '#38bdf8');
        gradient.addColorStop(1, '#7dd3fc');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      }

      // Draw Oscilloscope Smooth Waveform on top
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isPlaying ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)';

      const sliceWidth = width / 120;
      let x = 0;

      for (let i = 0; i < 120; i++) {
        let v = height / 2;
        if (isPlaying) {
          // Multiphase voice timbre simulation
          const wave1 = Math.sin(i * 0.08 + phase * 6) * 22;
          const wave2 = Math.sin(i * 0.16 - phase * 4) * 12;
          const wave3 = Math.cos(i * 0.3 + phase * 8) * 6;
          v += (wave1 + wave2 + wave3);
        } else {
          v += Math.sin(i * 0.1 + phase) * 2;
        }

        if (i === 0) {
          ctx.moveTo(x, v);
        } else {
          ctx.lineTo(x, v);
        }
        x += sliceWidth;
      }
      ctx.stroke();

      phase += isPlaying ? 0.04 : 0.005;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
      <canvas
        ref={canvasRef}
        width={720}
        height={140}
        className="w-full h-28 sm:h-32 block"
      />

      {/* Broadcast HUD Metadata Overlay */}
      <div className="absolute top-2 left-3 flex items-center gap-3 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-sky-400 animate-ping' : 'bg-slate-600'}`} />
          <span>{isPlaying ? 'REC-MONITOR [ACTIVE]' : 'STANDBY'}</span>
        </span>
        <span aria-hidden="true">·</span>
        <span>24.0 kHz · 16-BIT PCM</span>
        <span aria-hidden="true">·</span>
        <span>-14.2 LUFS TARGET</span>
      </div>

      <div className="absolute top-2 right-3 flex items-center gap-2 text-[10px] font-mono text-slate-400">
        <span>PEAK: {isPlaying ? '-2.8 dBFS' : '-∞ dBFS'}</span>
      </div>
    </div>
  );
};
