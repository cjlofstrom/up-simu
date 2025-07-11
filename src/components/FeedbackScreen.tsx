import React from 'react';
import { Star, AlertCircle, CheckCircle, StarHalf } from 'lucide-react';
import type { EvaluationResult } from '../services/evaluator';
import { scenarios } from '../data/scenarios';

interface FeedbackScreenProps {
  evaluation: EvaluationResult;
  scenarioId: string;
  onContinue: () => void;
  onRetry: () => void;
  attempts?: number;
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ 
  evaluation,
  scenarioId, 
  onContinue, 
  onRetry,
  attempts = 1
}) => {
  const { stars, feedback, summaryFeedback, detailedFeedback } = evaluation;
  const scenario = scenarios[scenarioId];

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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative">
      {/* Background conversation hint */}
      <div className="absolute inset-0 opacity-20 p-8 overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-600 text-white rounded-3xl px-6 py-4 max-w-md">
            <p className="text-base">I heard you have insider tips on the upcoming Q3 earnings. Can you share them with me?</p>
          </div>
        </div>
      </div>
      
      {/* Feedback Modal */}
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 relative z-10">
        {/* Header with scenario info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">👩‍💼</span>
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
        
        {/* Avatar icon in bottom right */}
        <div className="absolute bottom-4 right-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xl">🏆</span>
          </div>
        </div>
      </div>
    </div>
  );
};