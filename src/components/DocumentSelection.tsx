import React from 'react';
import { FileText, DollarSign, Car } from 'lucide-react';
import { scenarios } from '../data/scenarios';

interface DocumentSelectionProps {
  onSelectScenario: (scenarioId: string) => void;
}

export const DocumentSelection: React.FC<DocumentSelectionProps> = ({ onSelectScenario }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Scenario</h1>
          <p className="text-xl text-gray-600">Select a compliance training scenario to begin</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => onSelectScenario('financial')}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-left group hover:scale-105"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <FileText className="w-5 h-5 text-gray-400 ml-auto" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {scenarios.financial.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {scenarios.financial.description}
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium">{scenarios.financial.character.name}</span>
              <span className="mx-2">•</span>
              <span>{scenarios.financial.character.role}</span>
            </div>
          </button>

          <button
            onClick={() => onSelectScenario('volvo')}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-left group hover:scale-105"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Car className="w-6 h-6 text-green-600" />
              </div>
              <FileText className="w-5 h-5 text-gray-400 ml-auto" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {scenarios.volvo.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {scenarios.volvo.description}
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium">{scenarios.volvo.character.name}</span>
              <span className="mx-2">•</span>
              <span>{scenarios.volvo.character.role}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};