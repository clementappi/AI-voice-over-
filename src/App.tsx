import React, { useState, useEffect } from 'react';
import { VoiceProfileConfig, GeneratedAudioTake, DocumentaryChapter } from './types/tts';
import { DOCUMENTARY_CHAPTERS, VOICE_STYLE_TEMPLATES } from './data/defaultScripts';
import { base64ToAudioUrl, estimateReadTime, generateSyntheticAuditionTone } from './utils/audioHelper';
import { TopBar } from './components/TopBar';
import { VoiceProfileCard } from './components/VoiceProfileCard';
import { ScriptEditor } from './components/ScriptEditor';
import { StudioPlayer } from './components/StudioPlayer';
import { TakesHistory } from './components/TakesHistory';
import {
  Radio,
  FileText,
  Sliders,
  Archive,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'script' | 'profile' | 'studio' | 'takes'>('script');

  // Voice Profile Configuration (Adult American Male 30-40, medium-low pitch, investigative style)
  const [profile, setProfile] = useState<VoiceProfileConfig>({
    voiceName: 'Charon',
    ageRange: '30–40',
    accent: 'General American',
    pitch: 'medium-low',
    deliveryStyle: 'investigative-tech',
    pacing: 1.0,
    tensionLevel: 'moderate',
    strictFaithful: true,
  });

  // Chapters & Script state
  const [chapters] = useState<DocumentaryChapter[]>(DOCUMENTARY_CHAPTERS);
  const [activeChapterId, setActiveChapterId] = useState<string>('ch-1');
  const [currentText, setCurrentText] = useState<string>(DOCUMENTARY_CHAPTERS[0].text);

  // Audio generation & player state
  const [takes, setTakes] = useState<GeneratedAudioTake[]>([]);
  const [currentTake, setCurrentTake] = useState<GeneratedAudioTake | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Initialize sample take on mount so the user has an immediate playable stem
  useEffect(() => {
    let isCancelled = false;
    async function initSampleTake() {
      try {
        const sampleUrl = await generateSyntheticAuditionTone(14);
        if (isCancelled) return;
        const initialDate = new Date();
        const initialTake: GeneratedAudioTake = {
          id: 'take-demo-01',
          timestamp: initialDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Chapter 1: The Ambient Lens (Reference Audio)',
          chapterTitle: 'Chapter 1: The Ambient Lens',
          createdAt: initialDate.getTime(),
          text: DOCUMENTARY_CHAPTERS[0].text,
          voiceName: 'Charon (American Male)',
          audioUrl: sampleUrl,
          duration: 14.2,
          mimeType: 'audio/wav',
          sampleRate: 24000,
          bitDepth: 16,
          tensionLevel: 'moderate',
        };
        setTakes([initialTake]);
        setCurrentTake(initialTake);
      } catch (e) {
        console.error('Failed to generate sample take tone:', e);
      }
    }

    initSampleTake();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Update script text when switching chapters
  const handleSelectChapter = (id: string) => {
    setActiveChapterId(id);
    if (id === 'custom') {
      setCurrentText('');
    } else {
      const chapter = chapters.find((c) => c.id === id);
      if (chapter) {
        setCurrentText(chapter.text);
      }
    }
  };

  const handleResetChapter = () => {
    const chapter = chapters.find((c) => c.id === activeChapterId);
    if (chapter) {
      setCurrentText(chapter.text);
    }
  };

  // Generate TTS with Gemini 3.8 Flash TTS
  const handleSynthesizeTake = async () => {
    if (!currentText.trim()) {
      setErrorMessage('Please enter or select narration text to synthesize.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setStatusNotice(null);

    const activeChapter = chapters.find((c) => c.id === activeChapterId);
    const takeTitle = activeChapter ? activeChapter.title : 'Custom Narration Take';

    // Construct the rich documentary style prompt based on user's exact specification
    const stylePrompt = `Adult American male documentary narrator, 35 years old. Natural General American accent, medium-low pitch, clear articulation, mature, composed vocal presence. Sound intelligent, observant, controlled, and quietly authoritative. Build subtle tension as the story develops around surveillance, facial recognition, and personal privacy. Moderate pacing with natural pauses after important statements. Slow down slightly for major revelations. Natural human-like speech, consistent volume, clean pronunciation, subtle vocal texture, and believable emotional expression. Avoid robotic cadence, exaggerated trailer voice, dramatic whispering, news-anchor theatrics, artificial excitement, or overacting. Tension level: ${profile.tensionLevel}. Strictly read the text faithfully.`;

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          stylePrompt,
          voiceName: profile.voiceName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server error generating TTS audio.');
      }

      if (!data.audio) {
        throw new Error('No audio data received from Gemini 3.8 Flash TTS.');
      }

      // Convert returned base64 WAV into playable audio URL
      const audioUrl = base64ToAudioUrl(data.audio, data.mimeType || 'audio/wav');
      const estimatedDuration = estimateReadTime(currentText);

      const createdDate = new Date();
      const newTake: GeneratedAudioTake = {
        id: `take-${createdDate.getTime()}`,
        timestamp: createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `${takeTitle} [Take ${takes.length + 1}]`,
        chapterTitle: takeTitle,
        createdAt: createdDate.getTime(),
        text: currentText,
        voiceName: `${profile.voiceName} (Gemini 3.8 Flash TTS)`,
        audioUrl,
        duration: estimatedDuration,
        mimeType: data.mimeType || 'audio/wav',
        sampleRate: 24000,
        bitDepth: 16,
        tensionLevel: profile.tensionLevel,
      };

      setTakes((prev) => [newTake, ...prev]);
      setCurrentTake(newTake);
      setStatusNotice('Narration take synthesized successfully via Gemini 3.8 Flash TTS (24 kHz WAV).');
      setActiveTab('studio');
    } catch (err: any) {
      console.warn('Gemini 3.8 Flash TTS API invocation encountered an issue:', err);
      setErrorMessage(
        err?.message ||
          'Failed to connect to Gemini 3.8 Flash TTS. Please verify server API key or network status.'
      );

      // Offer fallback audition synthesis so user's creative workflow is never blocked
      try {
        const fallbackDate = new Date();
        const fallbackUrl = await generateSyntheticAuditionTone(estimateReadTime(currentText));
        const fallbackTake: GeneratedAudioTake = {
          id: `take-audition-${fallbackDate.getTime()}`,
          timestamp: fallbackDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `${takeTitle} [Studio Audition Take]`,
          chapterTitle: takeTitle,
          createdAt: fallbackDate.getTime(),
          text: currentText,
          voiceName: `${profile.voiceName} (Studio Audition Master)`,
          audioUrl: fallbackUrl,
          duration: estimateReadTime(currentText),
          mimeType: 'audio/wav',
          sampleRate: 24000,
          bitDepth: 16,
          tensionLevel: profile.tensionLevel,
        };
        setTakes((prev) => [fallbackTake, ...prev]);
        setCurrentTake(fallbackTake);
      } catch (fallbackErr) {
        console.error('Fallback synthesis error:', fallbackErr);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteTake = (id: string) => {
    setTakes((prev) => prev.filter((t) => t.id !== id));
    if (currentTake?.id === id) {
      setCurrentTake(takes.find((t) => t.id !== id) || null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Bar following Top Bar Contract */}
      <TopBar
        onGenerateClick={handleSynthesizeTake}
        isGenerating={isGenerating}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Documentary Production Banner / Kicker */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-sky-400">Investigative Documentary</span>
              <span aria-hidden="true">·</span>
              <span>Episode: &quot;The Panopticon Protocol&quot;</span>
              <span aria-hidden="true">·</span>
              <span>Model: gemini-3.8-flash-tts</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 text-balance">
              Documentary Narrator Voiceover Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Engineered for investigative technology storytelling: adult American male narrator (30–40), medium-low pitch, quietly authoritative delivery, building tension on facial recognition and privacy loss.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-3 lg:pt-0 lg:pl-6 text-xs text-slate-400">
            <div>
              <div className="font-mono text-slate-200 tabular-nums">24,000 Hz</div>
              <div className="text-[11px] text-slate-500">Master Sample Rate</div>
            </div>
            <div>
              <div className="font-mono text-slate-200 tabular-nums">16-Bit Mono</div>
              <div className="text-[11px] text-slate-500">Uncompressed RIFF WAV</div>
            </div>
            <div>
              <div className="font-mono text-sky-400 tabular-nums">135 WPM</div>
              <div className="text-[11px] text-slate-500">Documentary Cadence</div>
            </div>
          </div>
        </section>

        {/* Status & Error Alerts */}
        {errorMessage && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-3 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Notice: </span>
              {errorMessage}
              <div className="mt-1 text-rose-300/80">
                A studio audition take was loaded so you can test audio transport, scrub timeline, and teleprompter sync. Ensure GEMINI_API_KEY is configured in Settings &gt; Secrets for real-time model synthesis.
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 ml-2 font-mono"
            >
              ×
            </button>
          </div>
        )}

        {statusNotice && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusNotice}</span>
            </div>
            <button
              onClick={() => setStatusNotice(null)}
              className="text-emerald-400 hover:text-emerald-200 ml-2 font-mono"
            >
              ×
            </button>
          </div>
        )}

        {/* Primary Interactive Section Tabs on Mobile / Navigation Deck */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'script'
                ? 'bg-slate-800 text-sky-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Documentary Script</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-slate-800 text-sky-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>2. Voice Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-slate-800 text-sky-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>3. Playback Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('takes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'takes'
                ? 'bg-slate-800 text-sky-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>4. Takes Archive ({takes.length})</span>
          </button>
        </div>

        {/* Tab 1: Documentary Script & Live Editor */}
        {activeTab === 'script' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-6">
              <ScriptEditor
                chapters={chapters}
                activeChapterId={activeChapterId}
                onSelectChapter={handleSelectChapter}
                currentText={currentText}
                onChangeText={setCurrentText}
                onResetChapter={handleResetChapter}
              />

              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Ready to voice this chapter?
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Synthesizes verbatim narration using Gemini 3.8 Flash TTS with quiet authority.
                  </div>
                </div>

                <button
                  onClick={handleSynthesizeTake}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:bg-slate-700 disabled:text-slate-400 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Synthesize Take</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <StudioPlayer
                currentTake={currentTake}
                scriptText={currentText}
                onQuickAudition={handleSynthesizeTake}
                isGenerating={isGenerating}
                onExportSuccess={(filename) => setStatusNotice(`Exported master audio: ${filename}`)}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Voice Profile Deck */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <VoiceProfileCard config={profile} onChange={setProfile} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">
                  Documentary Pacing Mechanics
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In investigative broadcasting, tension is built not through volume or theatrics, but through measured momentum and strategic silence. When discussing facial recognition coordinates or legal loss of privacy, the narrator pauses after key revelations, allowing the audience to absorb the technical reality.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-sky-400 font-mono">
                  <span>Target Tempo: 130–140 WPM</span>
                  <span aria-hidden="true">·</span>
                  <span>Pause Weight: 0.6s–1.2s</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">
                  Faithful Narration Directive
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The model is prompted to adhere strictly to the supplied screenplay text. It does not add promotional hype, rhetorical tangents, or editorial summaries. This preserves the objectivity and journalistic integrity demanded by modern investigative documentary productions.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-mono">
                  <span>Integrity Protocol: Verbatim Script Lock</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Dedicated Playback Studio */}
        {activeTab === 'studio' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <StudioPlayer
              currentTake={currentTake}
              scriptText={currentText}
              onQuickAudition={handleSynthesizeTake}
              isGenerating={isGenerating}
              onExportSuccess={(filename) => setStatusNotice(`Exported master audio: ${filename}`)}
            />

            <div className="flex items-center justify-between p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">
                Want to try another chapter or adjust script text?
              </div>
              <button
                onClick={() => setActiveTab('script')}
                className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
              >
                Go to Script Editor &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Takes Archive */}
        {activeTab === 'takes' && (
          <div className="space-y-6">
            <TakesHistory
              takes={takes}
              activeTakeId={currentTake?.id || null}
              onSelectTake={(take) => {
                setCurrentTake(take);
                setActiveTab('studio');
              }}
              onDeleteTake={handleDeleteTake}
            />
          </div>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500 font-normal mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Chronicle Voice Studio · Professional Documentary Narration
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Powered by Gemini 3.8 Flash TTS</span>
            <span aria-hidden="true">·</span>
            <span>24 kHz Broadcast Output</span>
            <span aria-hidden="true">·</span>
            <span>American Male Narrator Persona</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
