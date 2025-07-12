import React from 'react';
import { Mic } from 'lucide-react';

interface ListeningOverlayProps {
  scenarioTitle: string;
  onClose: () => void;
}

export const ListeningOverlay: React.FC<ListeningOverlayProps> = ({ scenarioTitle, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 z-50 flex flex-col">
      {/* Header */}
      <div className="pt-8 px-8">
        <div className="flex items-center gap-4 bg-gray-800 text-white px-6 py-3 rounded-full inline-flex">
          <h1 className="text-xl font-medium">{scenarioTitle}</h1>
        </div>
      </div>

      {/* Listening Card */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-gray-900 rounded-3xl p-16 text-center max-w-2xl w-full">
          {/* Microphone Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-2 border-blue-500 flex items-center justify-center">
                <Mic className="w-16 h-16 text-blue-500" />
              </div>
              {/* Pulse animation */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-ping" />
            </div>
          </div>
          
          {/* Listening text */}
          <h2 className="text-3xl text-blue-500 font-medium">Listening</h2>
        </div>
      </div>
    </div>
  );
};