export interface Document {
  id: string;
  title: string;
  description: string;
  content: string;
  keywords: string[];
}

export interface ConversationStep {
  id: string;
  text: string;
  options: ConversationOption[];
}

export interface ConversationOption {
  id: string;
  text: string;
  keywords: string[];
  nextStepId?: string;
}

export interface UserProgress {
  documentId: string;
  completedSteps: string[];
  stars: number;
  keywordsUsed: string[];
}