import React from 'react';
import { ArrowRight } from 'lucide-react';
import { scenarios } from '../data/scenarios';

interface IntroScreenProps {
  scenarioId: string;
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ scenarioId, onStart }) => {
  const scenario = scenarios[scenarioId];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Now it's time to get real with
          </h1>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-8">
            {scenario.title}
          </h2>
          
          <div className="mb-8">
            <p className="text-lg text-gray-600 mb-4">
              You'll be responding to {scenario.character.name}, {scenario.character.role}
            </p>
            <p className="text-md text-gray-500">
              Choose your words carefully to demonstrate your knowledge and professionalism
            </p>
          </div>

          <button
            onClick={onStart}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center mx-auto gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Begin Scenario
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};