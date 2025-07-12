import { useState } from 'react';
import { DocumentSelection } from './components/DocumentSelection';
import { IntroScreen } from './components/IntroScreen';
import { CallScreen } from './components/CallScreen';
import { ConversationScreen } from './components/ConversationScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { FeedbackScreen } from './components/FeedbackScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { MapScreen } from './components/MapScreen';
import { evaluator } from './services/evaluator';
import type { EvaluationResult } from './services/evaluator';
import { gameState } from './services/gameState';
import { scenarioService } from './services/scenarioService';
import type { ScenarioContent } from './types/scenario';
import map1Image from '/map1.png';
import map2Image from '/map2.png';
import playerAvatar from '/player.svg';

type GameScreen = 'progress' | 'selection' | 'map' | 'intro' | 'call' | 'conversation' | 'processing' | 'feedback';

function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('progress');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [currentAttempts, setCurrentAttempts] = useState<number>(0);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<number>(1);
  const [currentScenarioContent, setCurrentScenarioContent] = useState<ScenarioContent | null>(null);
  const [shouldBounce, setShouldBounce] = useState<boolean>(false);
  const maxCheckpoints = 2; // Only 2 checkpoints as requested

  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setCurrentCheckpoint(1);
    setShouldBounce(false);
    const content = scenarioService.getScenarioForCheckpoint(scenarioId, 1);
    setCurrentScenarioContent(content);
    setCurrentScreen('map');
  };

  const handleStartScenario = () => {
    const progress = gameState.getScenarioProgress(selectedScenarioId);
    setCurrentAttempts(progress?.attempts || 0);
    setCurrentScreen('call');
  };

  const handleSubmitResponse = (response: string) => {
    if (!currentScenarioContent) return;
    const result = evaluator.evaluate(response, currentScenarioContent);
    setEvaluation(result);
    
    // Don't update game state here - it will be updated after animation in FeedbackScreen
    
    // Show processing screen first
    setCurrentScreen('processing');
    
    // Then show feedback after a delay
    setTimeout(() => {
      setCurrentScreen('feedback');
    }, 3000);
  };

  const handleContinue = () => {
    // Check if user got enough stars to progress
    if (evaluation && evaluation.stars <= 1.5) {
      // Not enough stars - return to map but stay at same checkpoint
      setShouldBounce(true);
      setCurrentScreen('map');
    } else {
      // Enough stars - progress to next checkpoint
      setShouldBounce(false);
      if (currentCheckpoint < maxCheckpoints) {
        const nextCheckpoint = currentCheckpoint + 1;
        setCurrentCheckpoint(nextCheckpoint);
        const content = scenarioService.getScenarioForCheckpoint(selectedScenarioId, nextCheckpoint);
        setCurrentScenarioContent(content);
        setCurrentScreen('map');
      } else {
        setCurrentScreen('progress');
        setSelectedScenarioId('');
        setEvaluation(null);
        setCurrentCheckpoint(1);
        setCurrentScenarioContent(null);
        setShouldBounce(false);
      }
    }
  };

  const handleRetry = () => {
    setCurrentScreen('call');
  };
  
  const handleAnswerCall = () => {
    setCurrentScreen('conversation');
  };

  const handleCheckpointClick = (checkpoint: number) => {
    if (checkpoint === currentCheckpoint) {
      const content = scenarioService.getScenarioForCheckpoint(selectedScenarioId, checkpoint);
      setCurrentScenarioContent(content);
      setShouldBounce(false); // Reset bounce state
      setCurrentScreen('intro');
    }
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
    
    case 'map':
      return currentScenarioContent ? (
        <MapScreen
          currentCheckpoint={currentCheckpoint}
          scenario={currentScenarioContent}
          onCheckpointClick={handleCheckpointClick}
          mapImage={currentCheckpoint === 1 ? map1Image : map2Image}
          playerAvatar={playerAvatar}
          shouldBounce={shouldBounce}
        />
      ) : null;
    
    case 'intro':
      return currentScenarioContent ? (
        <IntroScreen 
          scenario={currentScenarioContent}
          checkpointNumber={currentCheckpoint}
          onStart={handleStartScenario}
        />
      ) : null;
    
    case 'call':
      return currentScenarioContent ? (
        <CallScreen
          scenario={currentScenarioContent}
          onAnswer={handleAnswerCall}
        />
      ) : null;
    
    case 'conversation':
      return currentScenarioContent ? (
        <ConversationScreen 
          scenario={currentScenarioContent}
          onSubmit={handleSubmitResponse}
        />
      ) : null;
    
    case 'processing':
      return currentScenarioContent ? (
        <ProcessingScreen
          scenario={currentScenarioContent}
        />
      ) : null;
    
    case 'feedback':
      return evaluation && currentScenarioContent ? (
        <FeedbackScreen 
          evaluation={evaluation}
          scenarioId={selectedScenarioId}
          scenario={currentScenarioContent}
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