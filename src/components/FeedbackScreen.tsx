import React from 'react';
import { Star, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { EvaluationResult } from '../services/evaluator';

interface FeedbackScreenProps {
  evaluation: EvaluationResult;
  onContinue: () => void;
  onRetry: () => void;
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ 
  evaluation, 
  onContinue, 
  onRetry 
}) => {
  const { stars, feedback, detailedFeedback } = evaluation;

  const renderStars = () => {
    return [...Array(3)].map((_, i) => (
      <Star
        key={i}
        className={`w-12 h-12 ${
          i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getPerformanceColor = () => {
    if (stars === 3) return 'text-green-600';
    if (stars === 2) return 'text-blue-600';
    if (stars === 1) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceText = () => {
    if (stars === 3) return 'Excellent!';
    if (stars === 2) return 'Good Job!';
    if (stars === 1) return 'Getting There';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">{renderStars()}</div>
          <h2 className={`text-3xl font-bold mb-2 ${getPerformanceColor()}`}>
            {getPerformanceText()}
          </h2>
          <p className="text-lg text-gray-700">{feedback}</p>
        </div>

        <div className="space-y-4 mb-8">
          {detailedFeedback.requiredKeywordsFound.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">Key Points Covered</h4>
                  <p className="text-green-800 text-sm">
                    {detailedFeedback.requiredKeywordsFound.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {detailedFeedback.bonusKeywordsFound.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Bonus Points Earned</h4>
                  <p className="text-blue-800 text-sm">
                    {detailedFeedback.bonusKeywordsFound.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {detailedFeedback.missingRequiredKeywords.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900 mb-1">Missing Key Points</h4>
                  <p className="text-orange-800 text-sm">
                    Consider mentioning: {detailedFeedback.missingRequiredKeywords.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {detailedFeedback.forbiddenKeywordsFound.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Compliance Issues</h4>
                  <p className="text-red-800 text-sm">
                    Avoid using: {detailedFeedback.forbiddenKeywordsFound.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {stars < 3 && (
            <button
              onClick={onRetry}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={onContinue}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {stars === 3 ? 'Continue' : 'Next Scenario'}
          </button>
        </div>
      </div>
    </div>
  );
};