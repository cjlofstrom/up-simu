import React from 'react';
import { Trophy, Star, CheckCircle } from 'lucide-react';
import { gameState } from '../services/gameState';
import { scenarios } from '../data/scenarios';

interface ProgressScreenProps {
  onSelectScenario: (scenarioId: string) => void;
  onReset: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ onSelectScenario, onReset }) => {
  const state = gameState.getState();
  const totalStars = gameState.getTotalStars();

  const levelIcons = {
    Beginner: '🌱',
    Competent: '📈',
    Proficient: '🎯',
    Expert: '🏆',
  };

  const levelColors = {
    Beginner: 'from-green-400 to-green-600',
    Competent: 'from-blue-400 to-blue-600',
    Proficient: 'from-purple-400 to-purple-600',
    Expert: 'from-yellow-400 to-yellow-600',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{levelIcons[state.currentLevel]}</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {state.currentLevel} Level
            </h1>
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${levelColors[state.currentLevel]} text-white px-4 py-2 rounded-full`}>
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">{state.totalXP} XP</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{totalStars}</div>
              <div className="text-sm text-gray-600">Total Stars</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{state.completedScenarios.length}</div>
              <div className="text-sm text-gray-600">Scenarios Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{Object.keys(scenarios).length}</div>
              <div className="text-sm text-gray-600">Total Scenarios</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{3 - (totalStars % 3) || 3}</div>
              <div className="text-sm text-gray-600">Stars to Next Level</div>
            </div>
          </div>

          <div className="space-y-4">
            {Object.values(scenarios).map((scenario) => {
              const progress = gameState.getScenarioProgress(scenario.id);
              const stars = progress?.bestScore || 0;
              const attempts = progress?.attempts || 0;
              const completed = progress?.completed || false;

              return (
                <button
                  key={scenario.id}
                  onClick={() => onSelectScenario(scenario.id)}
                  className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{scenario.title}</h3>
                        {completed && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{scenario.description}</p>
                      {attempts > 0 && (
                        <p className="text-xs text-gray-500 mt-1">Attempts: {attempts}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onReset}
            className="text-gray-600 hover:text-gray-800 text-sm underline"
          >
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
};