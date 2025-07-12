import { scenarios } from '../data/scenarios';
import type { ScenarioContent, CheckpointContent } from '../types/scenario';
import type { Scenario } from '../data/scenarios';

export class ScenarioService {
  private checkpointContents: Map<string, CheckpointContent[]> = new Map();

  constructor() {
    this.initializeDefaultContent();
  }

  private convertScenarioToContent(scenario: Scenario, customQuestions?: string[]): ScenarioContent {
    return {
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      briefing: `You will be speaking with ${scenario.character.name}, ${scenario.character.role}.`,
      character: {
        name: scenario.character.name,
        title: scenario.character.role,
        avatar: scenario.character.avatar || '👤'
      },
      conversationIntro: "Now it's time to get real with Financial Compliance. It's 10am at the office.",
      questions: customQuestions || [scenario.question],
      requiredKeywords: scenario.keywords.required,
      feedback: {
        excellent: scenario.feedback.perfect,
        good: scenario.feedback.good,
        needsImprovement: scenario.feedback.needsWork
      }
    };
  }

  private initializeDefaultContent() {
    // Initialize financial compliance journey with multiple checkpoints
    const financialScenario = scenarios.financial;
    const financialCheckpoints: CheckpointContent[] = [
      {
        scenarioContent: this.convertScenarioToContent(financialScenario),
        checkpointNumber: 1
      },
      {
        scenarioContent: this.convertScenarioToContent(financialScenario),
        checkpointNumber: 2
      }
    ];
    
    this.checkpointContents.set('financial', financialCheckpoints);

    // Volvo journey can be added similarly
    const volvoCheckpoints: CheckpointContent[] = [
      {
        scenarioContent: this.convertScenarioToContent(scenarios.volvo),
        checkpointNumber: 1
      },
      {
        scenarioContent: this.convertScenarioToContent(scenarios.volvo),
        checkpointNumber: 2
      }
    ];
    
    this.checkpointContents.set('volvo', volvoCheckpoints);
  }

  getCheckpointContent(scenarioId: string, checkpoint: number): CheckpointContent | null {
    const checkpoints = this.checkpointContents.get(scenarioId);
    if (!checkpoints) return null;
    
    return checkpoints.find(cp => cp.checkpointNumber === checkpoint) || null;
  }

  getTotalCheckpoints(scenarioId: string): number {
    const checkpoints = this.checkpointContents.get(scenarioId);
    return checkpoints ? checkpoints.length : 1;
  }

  getScenarioForCheckpoint(scenarioId: string, checkpoint: number): ScenarioContent | null {
    const content = this.getCheckpointContent(scenarioId, checkpoint);
    return content ? content.scenarioContent : null;
  }
}

export const scenarioService = new ScenarioService();