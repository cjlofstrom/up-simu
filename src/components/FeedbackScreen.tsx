import React, { useState, useEffect } from 'react';
import { Star, StarHalf } from 'lucide-react';
import type { EvaluationResult } from '../services/evaluator';
import { gameState } from '../services/gameState';
import type { ScenarioContent } from '../types/scenario';

interface FeedbackScreenProps {
  evaluation: EvaluationResult;
  scenarioId: string;
  scenario: ScenarioContent;
  onContinue: () => void;
  onRetry: () => void;
  attempts?: number;
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ 
  evaluation,
  scenarioId,
  scenario,
  onContinue, 
  onRetry
}) => {
  const { stars, feedback, summaryFeedback } = evaluation;
  
  // Get the base total stars (before adding current scenario stars)
  const baseTotalStars = gameState.getTotalStars();
  const [displayedStars, setDisplayedStars] = useState(baseTotalStars);
  const [animatingStars, setAnimatingStars] = useState<number[]>([]);
  const [hasUpdatedGameState, setHasUpdatedGameState] = useState(false);
  
  // Animate stars being added to the total
  useEffect(() => {
    // Only animate new stars that haven't been counted before
    const currentBestScore = gameState.getScenarioProgress(scenarioId)?.bestScore || 0;
    const newStarsEarned = Math.floor(stars) - currentBestScore;
    const starsToAdd = Math.max(0, newStarsEarned);
    
    if (starsToAdd === 0) {
      // No new stars to add, just update game state
      if (!hasUpdatedGameState) {
        gameState.updateScenarioProgress(scenarioId, stars);
        setHasUpdatedGameState(true);
      }
      return;
    }
    
    const delay = 800; // Delay before starting animation
    const interval = 600; // Time between each star
    
    // Create array of star indices to animate
    const starIndices = Array.from({ length: starsToAdd }, (_, i) => i);
    
    // Start animation after a delay
    const timeoutId = setTimeout(() => {
      starIndices.forEach((index, i) => {
        setTimeout(() => {
          setAnimatingStars(prev => [...prev, index]);
          setDisplayedStars(prev => prev + 1);
          
          // Update game state after the last star animation
          if (i === starIndices.length - 1 && !hasUpdatedGameState) {
            setTimeout(() => {
              gameState.updateScenarioProgress(scenarioId, stars);
              setHasUpdatedGameState(true);
            }, 300);
          }
        }, i * interval);
      });
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [stars, scenarioId, hasUpdatedGameState]);

  const renderStars = () => {
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 !== 0;
    
    return [...Array(3)].map((_, i) => {
      if (i < fullStars) {
        return (
          <Star
            key={i}
            className="w-16 h-16 text-green-500 fill-green-500"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        return (
          <div key={i} className="relative w-16 h-16">
            <Star className="absolute w-16 h-16 text-gray-300" />
            <StarHalf className="absolute w-16 h-16 text-green-500 fill-green-500" />
          </div>
        );
      } else {
        return (
          <Star
            key={i}
            className="w-16 h-16 text-gray-300"
          />
        );
      }
    });
  };

  const getPerformanceColor = () => {
    if (stars >= 3) return 'text-green-600';
    if (stars >= 2) return 'text-gray-800';
    if (stars >= 1) return 'text-gray-800';
    if (stars >= 0.5) return 'text-gray-800';
    return 'text-gray-800';
  };

  const getPerformanceText = () => {
    if (stars >= 3) return 'Excellent!';
    if (stars >= 2) return 'Pretty Good!';
    if (stars >= 1) return 'Getting There';
    if (stars >= 0.5) return 'So Close!';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative">
      {/* Header with animated star counter */}
      <div className="fixed top-0 left-0 right-0 z-20 px-4 py-6">
        <div className="flex justify-end max-w-4xl mx-auto">
          <div className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-full relative">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <span className="text-xl font-medium transition-all duration-300">{displayedStars}</span>
            
            {/* Animated stars that fly to the counter */}
            {animatingStars.map((index) => (
              <div
                key={index}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  animation: `starFlyIn 0.6s ease-out forwards`,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Background conversation hint */}
      <div className="absolute inset-0 opacity-20 p-8 overflow-hidden pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-600 text-white rounded-3xl px-6 py-4 max-w-md">
            <p className="text-base">I heard you have insider tips on the upcoming Q3 earnings. Can you share them with me?</p>
          </div>
        </div>
      </div>
      
      {/* Feedback Modal */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 relative z-10">
          {/* Header with scenario info */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">{scenario.character.avatar || '👤'}</span>
              </div>
              <h3 className="text-xl font-semibold">{scenario.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-blue-500 fill-blue-500" />
              <span className="text-xl font-medium text-blue-500">+{stars}</span>
            </div>
          </div>
        
        {/* Stars */}
        <div className="flex justify-center mb-6">{renderStars()}</div>
        
        {/* Performance text */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold mb-4 ${getPerformanceColor()}`}>
            {getPerformanceText()}
          </h2>
          <p className="text-lg text-gray-600">{feedback}</p>
          {summaryFeedback && (
            <p className="text-md text-gray-500 mt-2">{summaryFeedback}</p>
          )}
        </div>

        {/* Remove detailed feedback sections for cleaner design */}

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full bg-black text-white text-lg font-medium py-4 rounded-full hover:bg-gray-800 transition-colors"
          >
            I see
          </button>
          {stars < 3 && (
            <button
              onClick={onRetry}
              className="w-full text-gray-600 text-base font-medium hover:text-gray-800 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};