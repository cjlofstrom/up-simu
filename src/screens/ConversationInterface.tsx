import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { conversationSteps, documents } from '../data/documents';
import type { ConversationOption } from '../types';

export const ConversationInterface: React.FC = () => {
  const { 
    selectedDocument, 
    setCurrentScreen, 
    currentStepId,
    setCurrentStepId,
    updateProgress,
    userProgress
  } = useApp();
  
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!selectedDocument) return null;

  const currentStep = conversationSteps[selectedDocument]?.find(step => step.id === currentStepId);
  const document = documents.find(doc => doc.id === selectedDocument);
  
  const progress = userProgress.find(p => p.documentId === selectedDocument) || {
    documentId: selectedDocument,
    completedSteps: [],
    stars: 0,
    keywordsUsed: []
  };

  const handleOptionSelect = (option: ConversationOption) => {
    const newKeywords = [...new Set([...selectedKeywords, ...option.keywords])];
    setSelectedKeywords(newKeywords);
    setShowFeedback(true);

    const allKeywordsUsed = [...new Set([...progress.keywordsUsed, ...option.keywords])];
    const completedSteps = [...new Set([...progress.completedSteps, currentStepId])];
    
    const stars = Math.min(3, Math.floor(allKeywordsUsed.length / 3));

    updateProgress({
      documentId: selectedDocument,
      completedSteps,
      stars,
      keywordsUsed: allKeywordsUsed
    });

    setTimeout(() => {
      setShowFeedback(false);
      if (option.nextStepId) {
        setCurrentStepId(option.nextStepId);
      }
    }, 2000);
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map(star => (
          <svg
            key={star}
            className={`w-6 h-6 ${star <= progress.stars ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto pt-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-blue-800">{document?.title}</h2>
            {renderStars()}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Keywords found: {progress.keywordsUsed.length}/{document?.keywords.length || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              AI
            </div>
            <div className="flex-1">
              <p className="text-gray-800">{currentStep?.text}</p>
            </div>
          </div>

          {showFeedback && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-800 text-sm">
                Great choice! You used keywords: {selectedKeywords.slice(-3).join(', ')}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {currentStep?.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                disabled={showFeedback}
                className="w-full text-left p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {option.text}
              </button>
            ))}
          </div>

          {currentStep?.options.length === 0 && (
            <button
              onClick={() => setCurrentScreen('selection')}
              className="w-full mt-4 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Back to Documents
            </button>
          )}
        </div>

        <button
          onClick={() => setCurrentScreen('selection')}
          className="w-full text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          ← Back to selection
        </button>
      </div>
    </div>
  );
};