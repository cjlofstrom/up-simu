import React, { useState } from 'react';
import { Send, User } from 'lucide-react';
import { scenarios } from '../data/scenarios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'character';
}

interface ConversationScreenProps {
  scenarioId: string;
  onSubmit: (response: string) => void;
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({ scenarioId, onSubmit }) => {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [followUpAttempts, setFollowUpAttempts] = useState<Record<string, number>>({});
  const [lastFollowUpQuestion, setLastFollowUpQuestion] = useState<string>('');
  const scenario = scenarios[scenarioId];

  // Initialize with first question
  React.useEffect(() => {
    setMessages([{
      id: '1',
      text: scenario.question,
      sender: 'character'
    }]);
  }, [scenario.question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (response.trim() && !isSubmitting) {
      setIsSubmitting(true);
      
      // Add user message to conversation
      const userMessage: Message = {
        id: Date.now().toString(),
        text: response,
        sender: 'user'
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Track which keywords have been covered across all messages
      const allUserMessages = messages
        .filter(m => m.sender === 'user')
        .map(m => m.text)
        .concat(response)
        .join(' ');
      const normalizedAllResponses = allUserMessages.toLowerCase();
      
      const coveredInConversation: string[] = [];
      const yearPattern = /\b(19\d{2}|20\d{2})\b/;
      const hasAttemptedYear = yearPattern.test(allUserMessages);
      
      scenario.keywords.required.forEach(keyword => {
        if (normalizedAllResponses.includes(keyword.toLowerCase()) || 
            (keyword === 'ÖV4' && (normalizedAllResponses.includes('öv4') || normalizedAllResponses.includes('ov4'))) ||
            (keyword === 'Jakob' && (normalizedAllResponses.includes('jakob') || normalizedAllResponses.includes('jacob')))) {
          coveredInConversation.push(keyword);
        } else if (keyword === '1927' && hasAttemptedYear) {
          // User attempted to provide a year, don't ask for it again
          coveredInConversation.push('year_attempted');
        }
      });
      
      // Find missing keywords
      const missingKeywords = scenario.keywords.required.filter(kw => !coveredInConversation.includes(kw));
      
      // Determine if we should continue conversation
      const hasAllRequiredKeywords = missingKeywords.length === 0;
      
      if (!conversationComplete && !hasAllRequiredKeywords) {
        let followUpText = '';
        
        if (scenario.id === 'volvo') {
          // Smart follow-up for Volvo scenario
          const hasYear = coveredInConversation.includes('1927') || coveredInConversation.includes('year_attempted');
          const hasModel = coveredInConversation.includes('ÖV4');
          const hasInspiration = coveredInConversation.includes('Jakob');
          
          // Check if we should force end the conversation
          if (followUpAttempts.forceEnd) {
            // End conversation after the retry attempt
            setConversationComplete(true);
            onSubmit(allUserMessages);
            return;
          }
          
          // Check if this is a retry for the same question  
          const currentState = `${hasYear}-${hasModel}-${hasInspiration}`;
          const attempts = followUpAttempts[currentState] || 0;
          const isRetry = lastFollowUpQuestion && attempts > 0;
          
          // Normal follow-up logic
          if (!hasYear && (hasModel || hasInspiration)) {
            followUpText = "Good! But what year did we start production?";
          } else if (hasYear && !hasModel && !hasInspiration) {
            followUpText = "Good, you know the year! But what was the model name and who was it nicknamed after?";
          } else if (hasYear && hasInspiration && !hasModel) {
            followUpText = "Great! You know the year and inspiration. What was the model name?";
          } else if (hasYear && hasModel && !hasInspiration) {
            followUpText = "Excellent! You know the year and model. Who was it nicknamed after?";
          } else if (!hasYear && !hasModel && hasInspiration) {
            followUpText = "Good, you know about Jakob! What year did we start production and what was the model name?";
          } else if (!hasYear && hasModel && !hasInspiration) {
            followUpText = "Good, you know the model! What year did we start production and who was it nicknamed after?";
          }
          
          if (followUpText) {
            // Track attempts for this state
            const newAttempts = followUpAttempts[currentState] || 0;
            
            // If this is the second attempt at the same state, show retry message
            if (lastFollowUpQuestion && newAttempts === 1) {
              followUpText = "Are you sure you remember that correctly? Have one more go";
              // Mark that next response should end conversation
              setFollowUpAttempts(prev => ({ ...prev, forceEnd: true }));
            } else if (!followUpAttempts.forceEnd) {
              // First attempt - increment counter
              setFollowUpAttempts(prev => ({ ...prev, [currentState]: newAttempts + 1 }));
            }
          }
        } else if (scenario.id === 'financial') {
          // Smart follow-up for financial scenario
          const normalizedResponse = response.toLowerCase();
          if ((normalizedResponse.includes('no') || normalizedResponse.includes('nope')) && 
              missingKeywords.some(kw => ['compliance', 'regulations', 'policy', 'insider', 'illegal'].includes(kw))) {
            followUpText = "How come? Why not? I thought you were supposed to help me make money!";
          }
        }
        
        if (followUpText) {
          // Add follow-up question
          setLastFollowUpQuestion(followUpText);
          setTimeout(() => {
            const followUpMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: followUpText,
              sender: 'character'
            };
            setMessages(prev => [...prev, followUpMessage]);
            setResponse('');
            setIsSubmitting(false);
          }, 500);
        } else {
          // No appropriate follow-up, complete the conversation
          setConversationComplete(true);
          onSubmit(allUserMessages);
        }
      } else {
        // Conversation complete, evaluate all responses
        const allUserResponses = messages
          .filter(m => m.sender === 'user')
          .map(m => m.text)
          .concat(response)
          .join(' ');
        setConversationComplete(true);
        onSubmit(allUserResponses);
      }
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
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                {message.sender === 'character' ? (
                  <>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="bg-blue-500 text-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                      <p className="text-base">{message.text}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="ml-auto bg-gray-200 text-gray-800 rounded-2xl rounded-tr-sm px-4 py-3 max-w-md">
                      <p className="text-base">{message.text}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
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
              disabled={isSubmitting || conversationComplete}
              autoFocus
            />
            <button
              type="submit"
              disabled={!response.trim() || isSubmitting || conversationComplete}
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