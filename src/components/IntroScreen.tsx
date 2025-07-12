import React from 'react';
import { Star } from 'lucide-react';
import { gameState } from '../services/gameState';
import type { ScenarioContent } from '../types/scenario';

interface IntroScreenProps {
  scenario: ScenarioContent;
  checkpointNumber: number;
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ scenario, onStart }) => {
  const totalStars = gameState.getTotalStars();

  return (
    <div className="min-h-screen bg-gray-600 flex flex-col items-center justify-center relative p-4">
      {/* Header */}
      <div className="fixed top-8 left-0 right-0 flex justify-between px-8">
        <div className="flex items-center gap-4 bg-gray-800 text-white px-6 py-3 rounded-full">
          <h1 className="text-xl font-medium">{scenario.title}</h1>
        </div>
        
        {/* Total stars display */}
        <div className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-full">
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          <span className="text-xl font-medium">{totalStars}</span>
        </div>
      </div>

      {/* Host message bubble */}
      <div className="max-w-2xl w-full px-4">
        <div className="flex items-end gap-2 max-w-[80%] mx-auto">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🧑‍🏫</span>
          </div>
          <div className="bg-white rounded-3xl rounded-bl-lg px-6 py-4 shadow-xl">
            <p className="text-lg">
              {scenario.conversationIntro || `Now it's time to get real with ${scenario.title}. It's 10am at the office.`}
            </p>
            <p className="text-lg mt-2">
              Choose your words carefully to demonstrate your knowledge and professionalism
            </p>
            
            <button
              onClick={onStart}
              className="w-full bg-black text-white text-lg font-medium py-3 rounded-full hover:bg-gray-800 transition-colors mt-4"
            >
              OK!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};