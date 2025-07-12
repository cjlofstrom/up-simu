import React from 'react';

export const SendingIndicator: React.FC = () => {
  return (
    <div className="flex justify-end">
      <div className="bg-gray-700 rounded-3xl rounded-br-lg px-6 py-4 max-w-[80%] shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-gray-400">Sending</span>
          <div className="relative w-8 h-8">
            {/* Animated spinner */}
            <div className="absolute inset-0 rounded-full border-2 border-gray-500"></div>
            <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            <div className="absolute inset-[6px] bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};