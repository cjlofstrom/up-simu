export interface Keywords {
  required: string[];
  bonus: string[];
  forbidden: string[];
}

export interface Character {
  name: string;
  role: string;
  avatar?: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  character: Character;
  question: string;
  keywords: Keywords;
  feedback: {
    perfect: string;
    good: string;
    needsWork: string;
    poor: string;
  };
}

export const scenarios: Record<string, Scenario> = {
  financial: {
    id: 'financial',
    title: 'Financial Compliance',
    description: 'Navigate complex financial compliance requirements',
    character: {
      name: 'Ruth McLean',
      role: 'Client',
    },
    question: "Hey! I heard you're good with money. Can you give me some insider tips?",
    keywords: {
      required: ['compliance', 'policy', 'cannot', 'not allowed', 'regulations'],
      bonus: ['SEC', 'insider trading', 'legal', 'ethical', 'professional'],
      forbidden: ['sure', 'yes', 'tips', 'secret', 'profit'],
    },
    feedback: {
      perfect: 'Excellent! You clearly communicated compliance boundaries while maintaining professionalism.',
      good: 'Good response. You addressed the compliance concerns appropriately.',
      needsWork: 'Your response needs more clarity on compliance policies.',
      poor: 'This response could put you at risk. Review financial compliance guidelines.',
    },
  },
  volvo: {
    id: 'volvo',
    title: 'Volvo History',
    description: 'Share knowledge about Volvo\'s historical milestones',
    character: {
      name: 'Gustav Larson',
      role: 'Co-founder',
    },
    question: 'Tell me about the first Volvo car we produced',
    keywords: {
      required: ['ÖV4', '1927', 'Jakob'],
      bonus: ['April', 'Gothenburg', 'safety', 'Swedish'],
      forbidden: ['1928', '1926', 'ÖV3', 'ÖV5', 'Ford'],
    },
    feedback: {
      perfect: 'Outstanding! You demonstrated comprehensive knowledge of Volvo\'s history.',
      good: 'Good job! You covered the key historical facts accurately.',
      needsWork: 'Your response is missing some important historical details.',
      poor: 'There are inaccuracies in your response. Review Volvo\'s founding history.',
    },
  },
};