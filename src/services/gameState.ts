interface ScenarioProgress {
  scenarioId: string;
  bestScore: number;
  attempts: number;
  completed: boolean;
}

interface GameState {
  currentLevel: 'Beginner' | 'Competent' | 'Proficient' | 'Expert';
  totalXP: number;
  scenarioProgress: Record<string, ScenarioProgress>;
  completedScenarios: string[];
}

const STORAGE_KEY = 'up-simu-game-state';
const XP_PER_STAR = 100;
const STARS_FOR_LEVEL_UP = 3;

class GameStateManager {
  private state: GameState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): GameState {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load game state:', e);
      }
    }
    return this.getInitialState();
  }

  private getInitialState(): GameState {
    return {
      currentLevel: 'Beginner',
      totalXP: 0,
      scenarioProgress: {},
      completedScenarios: [],
    };
  }

  private saveState(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  getState(): GameState {
    return { ...this.state };
  }

  updateScenarioProgress(scenarioId: string, stars: number): void {
    const progress = this.state.scenarioProgress[scenarioId] || {
      scenarioId,
      bestScore: 0,
      attempts: 0,
      completed: false,
    };

    progress.attempts += 1;
    progress.bestScore = Math.max(progress.bestScore, stars);
    progress.completed = progress.bestScore === 3;

    this.state.scenarioProgress[scenarioId] = progress;

    if (progress.completed && !this.state.completedScenarios.includes(scenarioId)) {
      this.state.completedScenarios.push(scenarioId);
    }

    this.state.totalXP = this.calculateTotalXP();
    this.updateLevel();
    this.saveState();
  }

  private calculateTotalXP(): number {
    return Object.values(this.state.scenarioProgress).reduce(
      (total, progress) => total + progress.bestScore * XP_PER_STAR,
      0
    );
  }

  private updateLevel(): void {
    const totalStars = Object.values(this.state.scenarioProgress).reduce(
      (total, progress) => total + progress.bestScore,
      0
    );

    if (totalStars >= STARS_FOR_LEVEL_UP * 3) {
      this.state.currentLevel = 'Expert';
    } else if (totalStars >= STARS_FOR_LEVEL_UP * 2) {
      this.state.currentLevel = 'Proficient';
    } else if (totalStars >= STARS_FOR_LEVEL_UP) {
      this.state.currentLevel = 'Competent';
    } else {
      this.state.currentLevel = 'Beginner';
    }
  }

  getScenarioProgress(scenarioId: string): ScenarioProgress | undefined {
    return this.state.scenarioProgress[scenarioId];
  }

  getTotalStars(): number {
    return Object.values(this.state.scenarioProgress).reduce(
      (total, progress) => total + progress.bestScore,
      0
    );
  }

  resetProgress(): void {
    this.state = this.getInitialState();
    this.saveState();
  }
}

export const gameState = new GameStateManager();