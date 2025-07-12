import React from 'react';
import { Mic } from 'lucide-react';

interface SpeakAgainButtonProps {
  onClick: () => void;
}

export const SpeakAgainButton: React.FC<SpeakAgainButtonProps> = ({ onClick }) => {
  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full transition-colors"
      >
        <Mic className="w-5 h-5" />
        <span className="font-medium">Speak again</span>
      </button>
    </div>
  );
};