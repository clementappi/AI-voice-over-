import { DocumentaryChapter } from '../types/tts';

export const DOCUMENTARY_CHAPTERS: DocumentaryChapter[] = [
  {
    id: 'ch-1',
    title: 'Chapter 1: The Ambient Lens',
    subtitle: 'Municipal Surveillance & Ubiquitous Capture',
    tensionTheme: 'Subtle tension, observant opening revelation',
    text: `It began not with an alarm or a public decree, but with an unnoticed software deployment. Across eight thousand municipal intersections, high-resolution cameras quietly shifted from monitoring traffic congestion to calculating the geometry of human faces.

Pedestrians crossing the avenue never looked up. They had no reason to believe that their morning walk had transformed into a continuous biometric catalog.`,
    estimatedDurationSeconds: 24,
    wordCount: 56,
  },
  {
    id: 'ch-2',
    title: 'Chapter 2: The Biometric Vector',
    subtitle: 'Nodal Points & Algorithmic Geometry',
    tensionTheme: 'Controlled analytical delivery, scientific precision',
    text: `Every human face contains eighty distinct nodal coordinates. The distance between the pupils. The breadth of the nasal bridge. The precise curvature of the zygomatic bone.

In less than forty milliseconds, specialized neural networks reduce a stranger in a crowded subway terminal to a searchable, thirty-two-dimensional mathematical vector. An identity unlocked before the commuter even taps their transit card.`,
    estimatedDurationSeconds: 28,
    wordCount: 57,
  },
  {
    id: 'ch-3',
    title: 'Chapter 3: The Vanishing Public Self',
    subtitle: 'Erosion of Urban Anonymity',
    tensionTheme: 'Building tension, philosophical investigation',
    text: `For centuries, navigating a metropolitan street carried an implicit social contract: the right to be unremembered. You were simply one of millions, safely dissolved within the collective rhythm of the city.

Today, that constitutional anonymity has been systematically dismantled without a single ballot cast. The public square is no longer a shared commons. It is an indexed database.`,
    estimatedDurationSeconds: 26,
    wordCount: 56,
  },
  {
    id: 'ch-4',
    title: 'Chapter 4: The Closed Loop',
    subtitle: 'Predictive Profiling & The Final Ledger',
    tensionTheme: 'Mature, quiet authority with culminating tension',
    text: `The true peril of modern surveillance is not merely that our past movements are archived. It is that the system has begun to anticipate what we will do next.

When an entire society accepts that its physical presence belongs to an unseen corporate ledger, the nature of personal liberty does not collapse with fanfare. It quietly ceases to exist.`,
    estimatedDurationSeconds: 27,
    wordCount: 58,
  },
];

export const VOICE_STYLE_TEMPLATES = {
  subtle:
    'Adult American male documentary narrator, 35 years old. Natural General American accent, medium-low pitch, clear articulation, mature, composed vocal presence. Sound intelligent, observant, controlled, and quietly authoritative. Build subtle tension. Moderate pacing with natural pauses after important statements. Avoid robotic cadence, exaggerated trailer voice, dramatic whispering, news-anchor theatrics, or overacting.',
  moderate:
    'Adult American male documentary narrator, 35 years old. Natural General American accent, medium-low pitch, clear articulation, mature, composed vocal presence. Sound intelligent, observant, controlled, and quietly authoritative. Build perceptible tension as the investigation unfolds around facial recognition and privacy loss. Slow down slightly for major revelations, with natural pauses. Avoid robotic cadence, exaggerated deep voice, or artificial excitement.',
  heightened:
    'Adult American male documentary narrator, 38 years old. Natural General American accent, medium-low pitch, clear articulation, grave and authoritative documentary cadence. High investigative tension and serious emotional resonance regarding surveillance ethics. Controlled, deliberate delivery with weighted pauses after critical statements. Strictly avoid trailer movie cliches or theatrical whispering.',
};
