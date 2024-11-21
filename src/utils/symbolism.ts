import { SymbolMeaning } from '../types';

const symbolDatabase: Record<string, SymbolMeaning[]> = {
  wolf: [
    {
      symbol: 'Wolf',
      meaning: 'Loyalty and Family',
      culture: 'Native American',
      description: 'Wolves symbolize loyalty, strong family ties, and good communication. They represent leadership and the importance of community.',
    },
  ],
  lotus: [
    {
      symbol: 'Lotus',
      meaning: 'Enlightenment and Purity',
      culture: 'Buddhist',
      description: 'The lotus represents spiritual enlightenment and purity. Rising from muddy waters to bloom in pristine beauty, it symbolizes rising above adversity.',
    },
  ],
  phoenix: [
    {
      symbol: 'Phoenix',
      meaning: 'Rebirth and Transformation',
      culture: 'Greek',
      description: 'The phoenix symbolizes renewal, resurrection, and overcoming great obstacles. It represents the cycle of death and rebirth.',
    },
  ],
  // Add more symbols as needed
};

export function analyzeSymbolism(prompt: string): SymbolMeaning[] {
  const meanings: SymbolMeaning[] = [];
  const words = prompt.toLowerCase().split(' ');
  
  for (const word of words) {
    if (symbolDatabase[word]) {
      meanings.push(...symbolDatabase[word]);
    }
  }
  
  return meanings;
}