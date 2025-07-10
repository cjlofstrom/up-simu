import React from 'react';
import { useApp } from '../context/AppContext';
import { documents } from '../data/documents';

export const ProgressTracking: React.FC = () => {
  const { userProgress, setCurrentScreen, setSelectedDocument, setCurrentStepId } = useApp();

  const handleContinue = (documentId: string) => {
    setSelectedDocument(documentId);
    const progress = userProgress.find(p => p.documentId === documentId);
    const stepId = progress?.completedSteps.length ? `${documentId.split('-').map(w => w[0]).join('')}-start` : `${documentId.split('-').map(w => w[0]).join('')}-start`;
    setCurrentStepId(stepId);
    setCurrentScreen('conversation');
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map(star => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= count ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const totalStars = userProgress.reduce((sum, p) => sum + p.stars, 0);
  const maxStars = documents.length * 3;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white p-4">
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-3xl font-bold text-primary-900 text-center mb-4">
          Your Progress
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Total Progress</p>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round((totalStars / maxStars) * 3))}
            </div>
            <p className="text-2xl font-bold text-primary-800">
              {totalStars} / {maxStars} Stars
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {documents.map(doc => {
            const progress = userProgress.find(p => p.documentId === doc.id);
            const stars = progress?.stars || 0;
            const keywordsFound = progress?.keywordsUsed.length || 0;
            const totalKeywords = doc.keywords.length;
            
            return (
              <div key={doc.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-primary-800">
                    {doc.title}
                  </h3>
                  {renderStars(stars)}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Keywords</span>
                    <span>{keywordsFound}/{totalKeywords}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(keywordsFound / totalKeywords) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleContinue(doc.id)}
                  className="w-full bg-primary-600 text-white rounded-lg py-2 font-semibold hover:bg-primary-700 transition-colors duration-200"
                >
                  {progress ? 'Continue' : 'Start'}
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setCurrentScreen('selection')}
          className="mt-6 w-full text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          ← Back to selection
        </button>
      </div>
    </div>
  );
};