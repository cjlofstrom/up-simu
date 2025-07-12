export interface ScenarioContent {
  id: string;
  title: string;
  description: string;
  briefing: string;
  character: {
    name: string;
    title: string;
    avatar: string;
  };
  conversationIntro: string;
  questions: string[];
  requiredKeywords: string[];
  bonusKeywords: string[];
  forbiddenKeywords: string[];
  feedback: {
    excellent: string;
    good: string;
    needsImprovement: string;
  };
}

export interface CheckpointContent {
  scenarioContent: ScenarioContent;
  checkpointNumber: number;
  customIntro?: string;
}