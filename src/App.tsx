import { useState } from 'react';
import { DocumentSelection } from './components/DocumentSelection';
import { IntroScreen } from './components/IntroScreen';
import { CallScreen } from './components/CallScreen';
import { ConversationScreen } from './components/ConversationScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { FeedbackScreen } from './components/FeedbackScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { evaluator } from './services/evaluator';
import type { EvaluationResult } from './services/evaluator';
import { gameState } from './services/gameState';
import { scenarios } from './data/scenarios';

type GameScreen = 'progress' | 'selection' | 'intro' | 'call' | 'conversation' | 'processing' | 'feedback';

function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('progress');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [currentAttempts, setCurrentAttempts] = useState<number>(0);

  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setCurrentScreen('intro');
  };

  const handleStartScenario = () => {
    const progress = gameState.getScenarioProgress(selectedScenarioId);
    setCurrentAttempts(progress?.attempts || 0);
    setCurrentScreen('call');
  };

  const handleSubmitResponse = (response: string) => {
    const scenario = scenarios[selectedScenarioId];
    const result = evaluator.evaluate(response, scenario);
    setEvaluation(result);
    
    // Update game state
    gameState.updateScenarioProgress(selectedScenarioId, result.stars);
    
    // Show processing screen first
    setCurrentScreen('processing');
    
    // Then show feedback after a delay
    setTimeout(() => {
      setCurrentScreen('feedback');
    }, 3000);
  };

  const handleContinue = () => {
    setCurrentScreen('progress');
    setSelectedScenarioId('');
    setEvaluation(null);
  };

  const handleRetry = () => {
    setCurrentScreen('call');
  };
  
  const handleAnswerCall = () => {
    setCurrentScreen('conversation');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress?')) {
      gameState.resetProgress();
      setCurrentScreen('selection');
    }
  };


  // Check if user has any progress
  const state = gameState.getState();
  const hasProgress = Object.keys(state.scenarioProgress).length > 0;

  // If no progress and on progress screen, show selection screen
  if (currentScreen === 'progress' && !hasProgress) {
    return <DocumentSelection onSelectScenario={handleSelectScenario} />;
  }

  switch (currentScreen) {
    case 'progress':
      return (
        <ProgressScreen 
          onSelectScenario={handleSelectScenario}
          onReset={handleReset}
        />
      );
    
    case 'selection':
      return <DocumentSelection onSelectScenario={handleSelectScenario} />;
    
    case 'intro':
      return (
        <IntroScreen 
          scenarioId={selectedScenarioId}
          onStart={handleStartScenario}
        />
      );
    
    case 'call':
      return (
        <CallScreen
          scenarioId={selectedScenarioId}
          onAnswer={handleAnswerCall}
        />
      );
    
    case 'conversation':
      return (
        <ConversationScreen 
          scenarioId={selectedScenarioId}
          onSubmit={handleSubmitResponse}
        />
      );
    
    case 'processing':
      return (
        <ProcessingScreen
          scenarioId={selectedScenarioId}
        />
      );
    
    case 'feedback':
      return evaluation ? (
        <FeedbackScreen 
          evaluation={evaluation}
          scenarioId={selectedScenarioId}
          onContinue={handleContinue}
          onRetry={handleRetry}
          attempts={currentAttempts + 1}
        />
      ) : null;
    
    default:
      return <DocumentSelection onSelectScenario={handleSelectScenario} />;
  }
}

export default App;