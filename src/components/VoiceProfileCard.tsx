import React from 'react';
import { VoiceProfileConfig } from '../types/tts';
import { ShieldCheck, Sliders, CheckCircle2, AlertOctagon } from 'lucide-react';

interface VoiceProfileCardProps {
  config: VoiceProfileConfig;
  onChange: (updated: VoiceProfileConfig) => void;
}

export const VoiceProfileCard: React.FC<VoiceProfileCardProps> = ({ config, onChange }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
            <span>Voice Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash TTS</span>
            <span aria-hidden="true">·</span>
            <span>24 kHz Broadcast Master</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 mt-1">
            Investigative Documentary Narrator
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Calibrated specifically for technology, surveillance, and civil liberty investigations. Delivers a composed, quietly authoritative presence with controlled tension.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium text-slate-300">Faithful Narration Active</span>
        </div>
      </div>

      {/* Grid of Profile Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-b border-slate-800/80">
        {/* Profile Item 1: Speaker Persona */}
        <div>
          <span className="text-xs uppercase font-medium text-slate-400">Speaker Persona</span>
          <div className="mt-2 text-sm font-semibold text-slate-100">Adult American Male</div>
          <p className="text-xs text-slate-400 mt-1">Approx. 30–40 years old, mature & composed vocal presence.</p>
        </div>

        {/* Profile Item 2: Accent & Tone */}
        <div>
          <span className="text-xs uppercase font-medium text-slate-400">Accent & Articulation</span>
          <div className="mt-2 text-sm font-semibold text-slate-100">General American</div>
          <p className="text-xs text-slate-400 mt-1">Clean articulation, subtle vocal texture, medium-low pitch.</p>
        </div>

        {/* Profile Item 3: Delivery Tone */}
        <div>
          <span className="text-xs uppercase font-medium text-slate-400">Delivery Style</span>
          <div className="mt-2 text-sm font-semibold text-slate-100">Quietly Authoritative</div>
          <p className="text-xs text-slate-400 mt-1">Intelligent, observant, controlled, with progressive investigative tension.</p>
        </div>

        {/* Profile Item 4: Pacing */}
        <div>
          <span className="text-xs uppercase font-medium text-slate-400">Pacing & Pauses</span>
          <div className="mt-2 text-sm font-semibold text-slate-100">Moderate (~135 wpm)</div>
          <p className="text-xs text-slate-400 mt-1">Natural pauses after critical revelations; steady momentum.</p>
        </div>
      </div>

      {/* Interactive Controls & Tension Gradient */}
      <div className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice Prebuilt Selection */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Prebuilt Narrator Persona
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChange({ ...config, voiceName: 'Charon' })}
              className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                config.voiceName === 'Charon'
                  ? 'bg-sky-950/40 border-sky-500 text-slate-100 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-semibold text-slate-200">Charon</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Authoritative, Resonant, Low-Mid</div>
            </button>

            <button
              onClick={() => onChange({ ...config, voiceName: 'Fenrir' })}
              className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                config.voiceName === 'Fenrir'
                  ? 'bg-sky-950/40 border-sky-500 text-slate-100 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-semibold text-slate-200">Fenrir</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Deep, Textured, Grave Grounding</div>
            </button>
          </div>
        </div>

        {/* Tension Level Adjustment */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Investigative Tension Gradient
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['subtle', 'moderate', 'heightened'] as const).map((level) => (
              <button
                key={level}
                onClick={() => onChange({ ...config, tensionLevel: level })}
                className={`py-2.5 px-3 text-center rounded-lg border capitalize text-xs font-medium transition-all cursor-pointer ${
                  config.tensionLevel === level
                    ? 'bg-sky-950/40 border-sky-500 text-sky-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            {config.tensionLevel === 'subtle' && 'Calm, observational cadence for opening context.'}
            {config.tensionLevel === 'moderate' && 'Focused, inquisitive pacing uncovering biometric data chains.'}
            {config.tensionLevel === 'heightened' && 'Grave, deliberate timing for key surveillance revelations.'}
          </p>
        </div>

        {/* Strict Faithful Delivery Lock */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Narration Protocol
          </label>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Strict Faithful Reading</span>
              <input
                type="checkbox"
                checked={config.strictFaithful}
                onChange={(e) => onChange({ ...config, strictFaithful: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Zero ad-libs, no promotional inflection, reads verbatim without adding conversational padding or improvisations.
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Safeguards / Avoidance Rules Box */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 bg-slate-950/40 -mx-6 -mb-6 px-6 pb-6 rounded-b-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3">
          <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Acoustic Guardrails (Prompt Enforced)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>No robotic cadence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>No trailer movie voice</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>No dramatic whispers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>No news anchor theatrics</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>No fake excitement</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>No artificial overacting</span>
          </div>
        </div>
      </div>
    </div>
  );
};
