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

export interface FollowUpQuestion {
  trigger: string[]; // Keywords that trigger this follow-up
  question: string;
  keywords: Keywords;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  character: Character;
  question: string;
  keywords: Keywords;
  followUps?: FollowUpQuestion[];
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
    followUps: [
      {
        trigger: ['no', 'nope', 'sorry', 'cannot'],
        question: "How come? Why not? I thought you were supposed to help me make money!",
        keywords: {
          required: ['compliance', 'regulations', 'insider', 'illegal', 'policy'],
          bonus: ['SEC', 'trading', 'ethical', 'professional', 'licensed'],
          forbidden: ['maybe', 'later', 'private', 'secret'],
        },
      },
    ],
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
    followUps: [
      {
        trigger: ['1927', '1928', '1926'],
        question: "Good, you know the year! But what was the model name and who was it nicknamed after?",
        keywords: {
          required: ['ÖV4', 'Jakob'],
          bonus: ['open', 'touring', 'four-cylinder'],
          forbidden: ['ÖV3', 'ÖV5'],
        },
      },
      {
        trigger: ['ÖV4', 'Jakob'],
        question: "Excellent! You know about Jakob. What year did we start production?",
        keywords: {
          required: ['1927'],
          bonus: ['April', '14th', 'Gothenburg'],
          forbidden: ['1928', '1926'],
        },
      },
    ],
    feedback: {
      perfect: 'Outstanding! You demonstrated comprehensive knowledge of Volvo\'s history.',
      good: 'Pretty good! You covered the key historical facts.',
      needsWork: 'Your response is missing some important historical details.',
      poor: 'There are inaccuracies in your response. Review Volvo\'s founding history.',
    },
  },
};