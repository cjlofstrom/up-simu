import React from 'react';
import { useApp } from '../context/AppContext';
import { documents } from '../data/documents';

export const DocumentSelection: React.FC = () => {
  const { setSelectedDocument, setCurrentScreen, setCurrentStepId } = useApp();

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocument(documentId);
    setCurrentStepId(`${documentId.split('-').map(w => w[0]).join('')}-start`);
    setCurrentScreen('conversation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white p-4">
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-3xl font-bold text-primary-900 text-center mb-8">
          Training Simulator
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Choose a document to start your training
        </p>
        
        <div className="space-y-4">
          {documents.map(doc => (
            <button
              key={doc.id}
              onClick={() => handleSelectDocument(doc.id)}
              className="w-full bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-primary-400"
            >
              <h3 className="text-xl font-semibold text-primary-800 mb-2">
                {doc.title}
              </h3>
              <p className="text-gray-600">
                {doc.description}
              </p>
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentScreen('progress')}
          className="mt-8 w-full bg-primary-600 text-white rounded-lg py-3 font-semibold hover:bg-primary-700 transition-colors duration-200"
        >
          View Progress
        </button>
      </div>
    </div>
  );
};