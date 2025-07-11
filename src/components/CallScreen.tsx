import React from 'react';
import { Phone, PhoneOff, Star } from 'lucide-react';
import { scenarios } from '../data/scenarios';
import { gameState } from '../services/gameState';

interface CallScreenProps {
  scenarioId: string;
  onAnswer: () => void;
}

export const CallScreen: React.FC<CallScreenProps> = ({ scenarioId, onAnswer }) => {
  const scenario = scenarios[scenarioId];
  const totalStars = gameState.getTotalStars();
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Total stars display */}
      <div className="fixed top-6 right-6">
        <div className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-lg font-medium">{totalStars}</span>
        </div>
      </div>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 text-white mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <h1 className="text-2xl font-semibold">{scenario.title}</h1>
          </div>
        </div>

        {/* Call Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl mx-auto max-w-sm">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center mb-6">
              <span className="text-5xl">👩‍💼</span>
            </div>
            
            {/* Caller Info */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {scenario.character.name}
            </h2>
            <p className="text-gray-600 mb-12">
              {scenario.character.role}
            </p>
            
            {/* Call Actions */}
            <div className="flex gap-8">
              <button
                onClick={() => window.location.reload()}
                className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                aria-label="Decline call"
              >
                <PhoneOff className="w-8 h-8 text-white transform rotate-135" />
              </button>
              
              <button
                onClick={onAnswer}
                className="w-20 h-20 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors animate-pulse"
                aria-label="Answer call"
              >
                <Phone className="w-8 h-8 text-white" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Incoming call animation */}
        <div className="mt-8 text-center text-white/60 animate-pulse">
          Incoming call...
        </div>
      </div>
    </div>
  );
};