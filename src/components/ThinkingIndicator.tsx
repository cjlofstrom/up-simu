import React from 'react';

export const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start px-4 py-2">
      <div className="bg-white rounded-2xl px-6 py-4 shadow-sm max-w-xs">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            {/* Animated spinner */}
            <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-[6px] bg-blue-500 rounded-full"></div>
          </div>
          <span className="text-gray-600 text-sm">Thinking...</span>
        </div>
      </div>
    </div>
  );
};