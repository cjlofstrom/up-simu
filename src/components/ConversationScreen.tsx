import React, { useState } from 'react';
import { Send, User } from 'lucide-react';
import { scenarios } from '../data/scenarios';

interface ConversationScreenProps {
  scenarioId: string;
  onSubmit: (response: string) => void;
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({ scenarioId, onSubmit }) => {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scenario = scenarios[scenarioId];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (response.trim() && !isSubmitting) {
      setIsSubmitting(true);
      onSubmit(response);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{scenario.character.name}</h3>
            <p className="text-sm text-gray-500">{scenario.character.role}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="bg-blue-500 text-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                <p className="text-base">{scenario.question}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isSubmitting) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your response here..."
              className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] max-h-[200px]"
              disabled={isSubmitting}
              autoFocus
            />
            <button
              type="submit"
              disabled={!response.trim() || isSubmitting}
              className="bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-end"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Remember to address all compliance requirements in your response
          </p>
        </form>
      </div>
    </div>
  );
};