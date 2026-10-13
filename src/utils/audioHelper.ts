/**
 * Audio helper utilities for decoding, analyzing, and playing documentary voiceover takes.
 */

export function base64ToAudioUrl(base64Data: string, mimeType = 'audio/wav'): string {
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Generates a clean, professional documentary audio filename formatted based on
 * the documentary chapter title and precise timestamp.
 * E.g.: "Chapter_1_The_Ambient_Lens_2026-10-13_05-52-10.wav"
 */
export function generateWavFilename(chapterTitle: string, timestampDate: Date = new Date()): string {
  // Format chapter name cleanly (e.g. "Chapter 1: The Ambient Lens" -> "Chapter_1_The_Ambient_Lens")
  const cleanTitle = chapterTitle
    .replace(/Chapter\s+(\d+)\s*:\s*/i, 'Chapter_$1_')
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = timestampDate.getFullYear();
  const month = pad(timestampDate.getMonth() + 1);
  const day = pad(timestampDate.getDate());
  const hours = pad(timestampDate.getHours());
  const minutes = pad(timestampDate.getMinutes());
  const seconds = pad(timestampDate.getSeconds());

  const formattedTimestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  const baseName = cleanTitle || 'Documentary_Take';

  return `${baseName}_${formattedTimestamp}.wav`;
}

export function downloadWavFile(audioUrl: string, filename: string): string {
  const safeFilename = filename.endsWith('.wav') ? filename : `${filename}.wav`;
  const a = document.createElement('a');
  a.href = audioUrl;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return safeFilename;
}

export function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00.00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hundredths = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

export function estimateReadTime(text: string, wordsPerMinute = 135): number {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  // Documentary narration pacing is approximately 130-140 words per minute
  return Math.ceil((wordCount / wordsPerMinute) * 60);
}

/**
 * Creates an offline mock documentary preview audio (harmonic broadcast tone chime + ambient room tone)
 * for testing when offline or during dry-run auditions.
 */
export async function generateSyntheticAuditionTone(durationSeconds = 6): Promise<string> {
  const sampleRate = 24000;
  const numSamples = sampleRate * durationSeconds;
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
  const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Synthesize a warm, resonant voice-range harmonic drone (110Hz - 220Hz with soft room reverb envelope)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.sin((Math.PI * t) / durationSeconds);
    const fundamental = Math.sin(2 * Math.PI * 115 * t) * 0.25;
    const secondHarmonic = Math.sin(2 * Math.PI * 230 * t) * 0.15;
    const thirdHarmonic = Math.sin(2 * Math.PI * 345 * t) * 0.08;
    const whisperPink = (Math.random() * 2 - 1) * 0.015;
    channelData[i] = (fundamental + secondHarmonic + thirdHarmonic + whisperPink) * env;
  }

  // Convert buffer to 16-bit PCM WAV
  const wavBytes = audioBufferToWav(buffer);
  const blob = new Blob([wavBytes.buffer as ArrayBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function audioBufferToWav(buffer: AudioBuffer): Uint8Array {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = buffer.length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channel = buffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    const sample = Math.max(-1, Math.min(1, channel[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return new Uint8Array(arrayBuffer);
}
