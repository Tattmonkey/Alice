export interface FontStyle {
  id: string;
  name: string;
  description: string;
  creditCost: number;
}

export const FONT_STYLES: FontStyle[] = [
  {
    id: 'classic-script',
    name: 'Classic Script',
    description: 'Elegant and timeless calligraphy',
    creditCost: 1,
  },
  {
    id: 'gothic',
    name: 'Gothic',
    description: 'Bold and dramatic blackletter style',
    creditCost: 1,
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean and modern typography',
    creditCost: 1,
  },
  {
    id: 'chicano',
    name: 'Chicano',
    description: 'Bold, flowing letters with sharp edges',
    creditCost: 1,
  },
  {
    id: 'old-english',
    name: 'Old English',
    description: 'Traditional medieval-style lettering',
    creditCost: 1,
  },
  {
    id: 'graffiti',
    name: 'Graffiti',
    description: 'Urban street art style typography',
    creditCost: 1,
  },
  {
    id: 'tribal',
    name: 'Tribal',
    description: 'Bold geometric patterns and shapes',
    creditCost: 1,
  },
  {
    id: 'japanese',
    name: 'Japanese',
    description: 'Brush-style kanji-inspired lettering',
    creditCost: 1,
  },
  {
    id: 'arabic',
    name: 'Arabic',
    description: 'Flowing calligraphic Middle Eastern style',
    creditCost: 1,
  },
  {
    id: 'hebrew',
    name: 'Hebrew',
    description: 'Traditional Hebrew script styling',
    creditCost: 1,
  },
  {
    id: 'handwritten',
    name: 'Handwritten',
    description: 'Natural and personal feel',
    creditCost: 1,
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Artistic brushstroke lettering',
    creditCost: 1,
  }
];