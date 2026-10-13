import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Initialize server-side Gemini client with required User-Agent
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      model: 'gemini-3.8-flash-tts',
    });
  });

  // TTS Generation Endpoint with gemini-3.8-flash-tts
  app.post('/api/tts/generate', async (req, res) => {
    try {
      const { text, stylePrompt, voiceName = 'Charon' } = req.body;

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Valid text is required for speech synthesis.' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please attach an API key in Settings > Secrets.',
        });
      }

      const effectiveStyle = stylePrompt ||
        'Adult American male documentary narrator, 30-40 years old. Natural General American accent, medium-low pitch, clear articulation, mature, composed vocal presence. Sound intelligent, observant, controlled, and quietly authoritative. Build subtle tension as the story develops, especially around facial recognition, surveillance, and personal privacy. Moderate pacing with natural pauses after important statements. Slow down slightly for major revelations. Natural human-like speech, consistent volume, clean pronunciation, subtle vocal texture, and believable emotional expression. Avoid robotic cadence, exaggerated trailer voice, dramatic whispering, news-anchor theatrics, or overacting.';

      // Call Gemini 3.8 Flash TTS
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  style: effectiveStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Charon',
              },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = audioPart?.inlineData?.data;
      const mimeType = audioPart?.inlineData?.mimeType || 'audio/wav';

      if (!base64Audio) {
        return res.status(502).json({
          error: 'The Gemini TTS model returned no audio stream for the provided narration.',
        });
      }

      return res.json({
        audio: base64Audio,
        mimeType,
        textLength: text.trim().length,
        voice: voiceName,
        style: effectiveStyle,
      });
    } catch (err: any) {
      console.error('Error generating speech with gemini-3.8-flash-tts:', err);
      const errorMessage = err?.message || 'Speech generation encountered an internal error.';
      return res.status(500).json({ error: errorMessage });
    }
  });

  // Mount Vite middleware in development or static serve in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Chronicle Voice Studio] Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
