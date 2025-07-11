import React from 'react';

interface ThinkingIndicatorProps {
  avatar?: string;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ avatar }) => {
  return (
    <div className="flex justify-start">
      <div className="flex items-end gap-2 max-w-[80%]">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">{avatar || '👤'}</span>
        </div>
        <div className="bg-white rounded-3xl rounded-bl-lg px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              {/* Animated spinner */}
              <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-[6px] bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-gray-600">Thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );
};