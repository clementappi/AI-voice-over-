export interface VoiceProfileConfig {
  voiceName: string;
  ageRange: string;
  accent: string;
  pitch: 'low' | 'medium-low' | 'medium';
  deliveryStyle: 'investigative-tech' | 'subtle-tension' | 'climactic-revelation';
  pacing: number; // 0.85 to 1.15
  tensionLevel: 'subtle' | 'moderate' | 'heightened';
  strictFaithful: boolean;
}

export interface DocumentaryChapter {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  estimatedDurationSeconds: number;
  wordCount: number;
  tensionTheme: string;
}

export interface GeneratedAudioTake {
  id: string;
  timestamp: string;
  title: string;
  chapterTitle?: string;
  createdAt?: number;
  text: string;
  voiceName: string;
  audioUrl: string; // Blob or Data URL
  duration: number; // seconds
  mimeType: string;
  sampleRate: number;
  bitDepth: number;
  tensionLevel: string;
}

export interface TtsGenerationResponse {
  audio: string; // base64
  mimeType: string;
  textLength: number;
  voice: string;
  style: string;
}
