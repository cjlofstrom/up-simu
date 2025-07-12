import React from 'react';
import { Star } from 'lucide-react';
import { gameState } from '../services/gameState';
import type { ScenarioContent } from '../types/scenario';

interface ProcessingScreenProps {
  scenario: ScenarioContent;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ scenario }) => {
  const totalStars = gameState.getTotalStars();
  
  // Generate random positions for confetti elements
  const confettiElements = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    type: Math.random() > 0.5 ? 'shape' : 'dot',
    color: ['#3B82F6', '#EF4444', '#F59E0B', '#000000'][Math.floor(Math.random() * 4)],
    left: Math.random() * 80 + 10, // 10-90%
    top: Math.random() * 60 + 20, // 20-80%
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <div className="min-h-screen bg-gray-600 flex flex-col items-center justify-center px-4">
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

      {/* Processing Card */}
      <div className="relative bg-white rounded-3xl p-8 shadow-2xl mx-4 max-w-2xl w-full">
        <div className="relative w-full aspect-square max-w-md mx-auto">
          {/* Animated confetti */}
          {confettiElements.map((element) => (
            <div
              key={element.id}
              className="absolute"
              style={{
                left: `${element.left}%`,
                top: `${element.top}%`,
                animation: `float ${element.duration}s linear ${element.delay}s infinite`,
              }}
            >
              {element.type === 'shape' ? (
                <div
                  className={`w-4 h-4 transform rotate-45`}
                  style={{ backgroundColor: element.color }}
                />
              ) : (
                <div
                  className={`w-3 h-3 rounded-full`}
                  style={{ backgroundColor: element.color }}
                />
              )}
            </div>
          ))}
          
          {/* Central spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
          </div>
        </div>
        
        {/* Thinking text */}
        <div className="text-center mt-8">
          <h2 className="text-3xl font-light text-gray-900">Thinking...</h2>
        </div>
      </div>

    </div>
  );
};