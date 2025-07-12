import React, { useState, useEffect, useRef } from "react";
import { Send, User, Star, Mic } from "lucide-react";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { SendingIndicator } from "./SendingIndicator";
import { SpeakAgainButton } from "./SpeakAgainButton";
import { gameState } from "../services/gameState";
import { ListeningOverlay } from "./ListeningOverlay";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import type { ScenarioContent } from '../types/scenario';

interface Message {
  id: string;
  text: string;
  sender: "user" | "character";
}

interface ConversationScreenProps {
  scenario: ScenarioContent;
  onSubmit: (response: string) => void;
  onBackToMap?: () => void;
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({
  scenario,
  onSubmit,
  onBackToMap
}) => {
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [followUpAttempts, setFollowUpAttempts] = useState<
    Record<string, number | boolean>
  >({});
  const [lastFollowUpQuestion, setLastFollowUpQuestion] = useState<string>("");
  const [showThinking, setShowThinking] = useState(false);
  const [showListening, setShowListening] = useState(false);
  const [showSending, setShowSending] = useState(false);
  const [pendingVoiceText, setPendingVoiceText] = useState<string | null>(null);
  const [wasVoiceInput, setWasVoiceInput] = useState(false);
  const [voiceRetryCount, setVoiceRetryCount] = useState(0);
  const [showSpeakAgain, setShowSpeakAgain] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get total stars
  const totalStars = gameState.getTotalStars();
  
  // Speech recognition hook with 1s silence timeout
  const { isListening, transcript, error: speechError, startListening, stopListening } = useSpeechRecognition({
    onTranscript: (text) => {
      setResponse(text);
      setShowListening(false);
      setPendingVoiceText(text); // Store for auto-send
    },
    silenceTimeout: 1000 // 1 second
  });

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll when messages change or thinking/sending indicators appear
  useEffect(() => {
    scrollToBottom();
  }, [messages, showThinking, showSending, showSpeakAgain]);

  // Initialize with first question
  React.useEffect(() => {
    setMessages([
      {
        id: "1",
        text: scenario.questions[0],
        sender: "character",
      },
    ]);
  }, [scenario.questions]);

  // Auto-send voice input after 1.5s
  useEffect(() => {
    if (pendingVoiceText && !isSubmitting) {
      // Show sending state
      setShowSending(true);
      
      // Wait 1.5s then submit
      const timer = setTimeout(() => {
        setPendingVoiceText(null);
        handleSubmitVoice();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [pendingVoiceText]);

  // Helper function to generate contextual prefix for follow-ups
  const getContextualPrefix = (isCorrect: boolean, isFirstAttempt: boolean = true): string => {
    if (isCorrect) {
      return isFirstAttempt ? "Good!" : "Great!";
    } else {
      // For incorrect/partial answers
      const responses = ["Hmm okay :)", "Nice try :)", "Almost there :)", "Close :)"];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const handleMicrophoneClick = () => {
    if (!isListening && !conversationComplete) {
      setShowListening(true);
      startListening();
    }
  };

  const handleSpeakAgain = () => {
    setShowSpeakAgain(false);
    setResponse("");
    setShowListening(true);
    startListening();
  };

  const handleSubmitVoice = () => {
    if (response.trim() && !isSubmitting) {
      setIsSubmitting(true);
      setShowSending(false);
      setWasVoiceInput(true); // Mark as voice input

      // Add user message to conversation
      const userMessage: Message = {
        id: Date.now().toString(),
        text: response,
        sender: "user",
      };
      setMessages((prev) => [...prev, userMessage]);
      
      // Continue with regular submit logic
      processUserResponse(response);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (response.trim() && !isSubmitting) {
      setIsSubmitting(true);

      // Add user message to conversation
      const userMessage: Message = {
        id: Date.now().toString(),
        text: response,
        sender: "user",
      };
      setMessages((prev) => [...prev, userMessage]);
      
      // Process the response
      processUserResponse(response);
    }
  };
  
  const processUserResponse = (responseText: string) => {

      // Show thinking indicator
      setShowThinking(true);

      // Track which keywords have been covered across all messages
      const allUserMessages = messages
        .filter((m) => m.sender === "user")
        .map((m) => m.text)
        .concat(responseText)
        .join(" ");
      const normalizedAllResponses = allUserMessages.toLowerCase();

      const coveredInConversation: string[] = [];
      const yearPattern = /\b(19\d{2}|20\d{2})\b/;
      const hasAttemptedYear = yearPattern.test(allUserMessages);

      scenario.requiredKeywords.forEach((keyword) => {
        const keywordLower = keyword.toLowerCase();
        if (
          normalizedAllResponses.includes(keywordLower) ||
          (keyword === "ÖV4" &&
            (normalizedAllResponses.includes("öv4") ||
              normalizedAllResponses.includes("ov4"))) ||
          (keyword === "Jakob" &&
            (normalizedAllResponses.includes("jakob") ||
              normalizedAllResponses.includes("jacob"))) ||
          (keyword === "policy" &&
            (normalizedAllResponses.includes("policy") ||
              normalizedAllResponses.includes("policies"))) ||
          (keyword === "not allowed" &&
            (normalizedAllResponses.includes("not allowed") ||
              normalizedAllResponses.includes("against"))) ||
          (keyword === "cannot" &&
            (normalizedAllResponses.includes("cannot") ||
              normalizedAllResponses.includes("can't") ||
              normalizedAllResponses.includes("unable")))
        ) {
          coveredInConversation.push(keyword);
        } else if (keyword === "1927" && hasAttemptedYear) {
          // User attempted to provide a year, don't ask for it again
          coveredInConversation.push("year_attempted");
        }
      });

      // Find missing keywords
      const missingKeywords = scenario.requiredKeywords.filter(
        (kw) => !coveredInConversation.includes(kw),
      );

      // Determine if we should continue conversation
      const hasAllRequiredKeywords = missingKeywords.length === 0;

      if (!conversationComplete && !hasAllRequiredKeywords) {
        let followUpText = "";

        if (scenario.id === "volvo") {
          // Smart follow-up for Volvo scenario
          const normalizedResponse = responseText.toLowerCase();
          const hasCorrectYear = coveredInConversation.includes("1927");
          const hasAttemptedYear = coveredInConversation.includes("year_attempted");
          const hasYear = hasCorrectYear || hasAttemptedYear;
          const hasModel = coveredInConversation.includes("ÖV4");
          const hasInspiration = coveredInConversation.includes("Jakob");

          // Check if we should force end the conversation
          if (followUpAttempts.forceEnd === true) {
            // End conversation after the retry attempt
            // Don't include the confirmation response in the evaluation
            const previousUserMessages = messages
              .filter((m) => m.sender === "user")
              .map((m) => m.text)
              .join(" ");
            setConversationComplete(true);
            setIsSubmitting(false);
            // Wait 2 seconds to show the final message before processing
            setTimeout(() => {
              onSubmit(previousUserMessages);
            }, 2000);
            return;
          }

          // Check if this is a retry for the same question
          const currentState = `${hasYear}-${hasModel}-${hasInspiration}`;
          // const stateValue = followUpAttempts[currentState];
          // const attempts = typeof stateValue === 'number' ? stateValue : 0;
          // const isRetry = lastFollowUpQuestion && attempts > 0;

          // Normal follow-up logic with contextual responses
          if (!hasYear && (hasModel || hasInspiration)) {
            followUpText = "Good! But what year did we start production?";
          } else if (hasYear && !hasModel && !hasInspiration) {
            // Check if year was correct or just attempted
            const prefix = hasCorrectYear ? "Good, you know the year!" : getContextualPrefix(false);
            followUpText = `${prefix} But what was the model name and who was it nicknamed after?`;
          } else if (hasYear && hasInspiration && !hasModel) {
            const prefix = hasCorrectYear ? "Great! You know the year and inspiration." : getContextualPrefix(false);
            followUpText = `${prefix} What was the model name?`;
          } else if (hasYear && hasModel && !hasInspiration) {
            const prefix = hasCorrectYear ? "Excellent! You know the year and model." : getContextualPrefix(false);
            followUpText = `${prefix} Who was it nicknamed after?`;
          } else if (!hasYear && !hasModel && hasInspiration) {
            followUpText =
              "Good, you know about Jakob! What year did we start production and what was the model name?";
          } else if (!hasYear && hasModel && !hasInspiration) {
            followUpText =
              "Good, you know the model! What year did we start production and who was it nicknamed after?";
          }

          // Check if this is a vague/unhelpful response
          const isVagueResponse = normalizedResponse.includes("dont know") || 
                                normalizedResponse.includes("don't know") ||
                                normalizedResponse.includes("not sure") ||
                                normalizedResponse.includes("unsure") ||
                                normalizedResponse.includes("idk") ||
                                normalizedResponse.includes("dunno") ||
                                normalizedResponse.includes("no idea") ||
                                normalizedResponse.includes("forgot");
          
          if (followUpText || isVagueResponse) {
            // Track attempts for this state
            const stateValue = followUpAttempts[currentState];
            const newAttempts = typeof stateValue === 'number' ? stateValue : 0;

            // If this is a vague response after we've already asked, show simpler retry
            if (isVagueResponse && newAttempts >= 1) {
              followUpText = "Hmm, are you sure?";
              setFollowUpAttempts((prev) => ({ ...prev, forceEnd: true }));
            }
            // If this is the second attempt at the same state, show retry message
            else if (lastFollowUpQuestion && newAttempts === 1 && followUpText) {
              followUpText =
                "Are you sure you remember that correctly? Have one more go";
              // Mark that next response should end conversation
              setFollowUpAttempts((prev) => ({ ...prev, forceEnd: true }));
            } else if (!followUpAttempts.forceEnd && followUpText) {
              // First attempt - increment counter
              setFollowUpAttempts((prev) => ({
                ...prev,
                [currentState]: newAttempts + 1,
              }));
            }
          }
        } else if (scenario.id === "financial") {
          // Smart follow-up for financial scenario
          const normalizedResponse = responseText.toLowerCase();
          const allUserText = allUserMessages.toLowerCase();

          // Check if response is on-topic
          const hasYes =
            normalizedResponse.includes("yes") ||
            normalizedResponse.includes("sure") ||
            normalizedResponse.includes("ok") ||
            normalizedResponse.includes("yeah");
          const hasNo =
            normalizedResponse.includes("no") ||
            normalizedResponse.includes("nope") ||
            normalizedResponse.includes("can't") ||
            normalizedResponse.includes("cannot");
          const hasFinanceKeywords =
            normalizedResponse.includes("money") ||
            normalizedResponse.includes("tip") ||
            normalizedResponse.includes("invest") ||
            normalizedResponse.includes("stock") ||
            normalizedResponse.includes("trad") ||
            normalizedResponse.includes("complia") ||
            normalizedResponse.includes("polic") ||
            normalizedResponse.includes("regulat") ||
            normalizedResponse.includes("insider") ||
            normalizedResponse.includes("sec") ||
            normalizedResponse.includes("legal") ||
            normalizedResponse.includes("ethical");

          const isOffTopic =
            !hasYes &&
            !hasNo &&
            !hasFinanceKeywords &&
            normalizedResponse.length > 5;

          // Check what compliance concepts have been covered
          const hasRefusal =
            allUserText.includes("no") ||
            allUserText.includes("cannot") ||
            allUserText.includes("not allowed") ||
            allUserText.includes("can't");
          const hasCompliance = coveredInConversation.includes("compliance");
          const hasRegulations = coveredInConversation.includes("regulations");
          const hasPolicy = coveredInConversation.includes("policy");
          const hasInsiderInfo = allUserText.includes("insider");
          const hasLegalEthical =
            allUserText.includes("legal") ||
            allUserText.includes("ethical") ||
            allUserText.includes("sec") ||
            allUserText.includes("illegal");

          // Determine what's missing
          const needsComplianceExplanation =
            hasRefusal &&
            !hasCompliance &&
            !hasRegulations &&
            !hasPolicy &&
            !hasInsiderInfo;
          const needsSpecifics =
            hasRefusal &&
            (hasCompliance || hasRegulations || hasPolicy) &&
            !hasInsiderInfo &&
            !hasLegalEthical;
          // New: needs details about why it's against policy
          const needsPolicyDetails =
            hasRefusal &&
            hasPolicy &&
            !hasInsiderInfo &&
            !hasLegalEthical &&
            !allUserText.includes("sec") &&
            !allUserText.includes("trading");

          // Check if response is already complete
          // Complete = has refusal + policy/compliance + specific details (insider/SEC/legal)
          const hasCompleteResponse =
            hasRefusal &&
            (hasPolicy || hasCompliance || hasRegulations) &&
            (hasInsiderInfo ||
              hasLegalEthical ||
              allUserText.includes("sec") ||
              allUserText.includes("trading"));

          if (isOffTopic) {
            // Check if this was voice input and we haven't retried yet
            if (wasVoiceInput && voiceRetryCount === 0) {
              followUpText = "Am I talking to the right person? I'm lost.";
              setTimeout(() => {
                setShowThinking(false);
                const confusedMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  text: followUpText,
                  sender: "character",
                };
                setMessages((prev) => [...prev, confusedMessage]);
                setShowSpeakAgain(true); // Show speak again button
                setIsSubmitting(false);
                setVoiceRetryCount(1);
                setWasVoiceInput(false); // Reset for next attempt
              }, 1500);
              return;
            } else if (wasVoiceInput && voiceRetryCount === 1) {
              // Second voice attempt failed
              followUpText = "Ok.. Will call back later.";
            } else {
              // Regular text input off-topic
              followUpText = "Am I talking to the right person? I'm lost. Will call back later.";
            }
            
            // Mark conversation as complete after off-topic response
            setTimeout(() => {
              setShowThinking(false);
              const confusedMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: followUpText,
                sender: "character",
              };
              setMessages((prev) => [...prev, confusedMessage]);
              setConversationComplete(true);
              setIsSubmitting(false);
              setShowSpeakAgain(false);
              // Submit with a special marker for off-topic
              // Wait 2 seconds to show the final message before processing
              setTimeout(
                () => onSubmit(allUserMessages + " [OFF_TOPIC]"),
                2000,
              );
            }, 1500);
            return;
          } else if (hasCompleteResponse) {
            // Response is complete, end conversation successfully
            setConversationComplete(true);
            setIsSubmitting(false);
            // Wait 2 seconds to show the final message before processing
            setTimeout(() => {
              onSubmit(allUserMessages);
            }, 2000);
            return;
          } else if (followUpAttempts.forceEnd === true) {
            // This is a confirmation response after "Are you sure?", end conversation
            // Don't include the confirmation response in the evaluation
            const previousUserMessages = messages
              .filter((m) => m.sender === "user")
              .map((m) => m.text)
              .join(" ");
            setConversationComplete(true);
            setIsSubmitting(false);
            // Wait 2 seconds to show the final message before processing
            setTimeout(() => {
              onSubmit(previousUserMessages);
            }, 2000);
            return;
          } else {
            // Response is incomplete, determine what follow-up is needed
            const financialValue = followUpAttempts.financial;
            const financialAttempts = typeof financialValue === 'number' ? financialValue : 0;

            // Check if this is a vague/unhelpful response like "I don't know"
            const isVagueResponse = normalizedResponse.includes("dont know") || 
                                  normalizedResponse.includes("don't know") ||
                                  normalizedResponse.includes("not sure") ||
                                  normalizedResponse.includes("unsure") ||
                                  normalizedResponse.includes("idk") ||
                                  normalizedResponse.includes("dunno");
            
            // If we've already asked a follow-up and they're still vague, show "Hmm, are you sure?"
            if (financialAttempts >= 1 && (isVagueResponse || (!hasCompliance && !hasRegulations && !hasPolicy && !hasInsiderInfo))) {
              followUpText = "Hmm, are you sure?";
              // Mark that next response should end conversation
              setFollowUpAttempts((prev) => ({ ...prev, forceEnd: true }));
            }
            // First check what specific follow-up is needed
            else if (needsComplianceExplanation && financialAttempts === 0) {
              followUpText =
                "How come? Why not? I thought you were supposed to help me make money!";
              setFollowUpAttempts((prev) => ({
                ...prev,
                financial: financialAttempts + 1,
              }));
            } else if (needsPolicyDetails) {
              // They mentioned policy but need more details
              const prefix = hasPolicy ? getContextualPrefix(true) : "";
              followUpText = prefix ? 
                `${prefix} What about the policies makes this problematic? Can you be more specific?` :
                "What about the policies makes this problematic? Can you be more specific?";
              setFollowUpAttempts((prev) => ({
                ...prev,
                financial: financialAttempts + 1,
              }));
            } else if (needsSpecifics) {
              // They have some compliance words but need specifics
              const hasPartialAnswer = hasCompliance || hasRegulations || hasPolicy;
              const prefix = hasPartialAnswer ? getContextualPrefix(false) : "";
              followUpText = prefix ?
                `${prefix} But what specific regulations prevent you from giving me tips?` :
                "But what specific regulations prevent you from giving me tips? I don't understand.";
              setFollowUpAttempts((prev) => ({
                ...prev,
                financial: financialAttempts + 1,
              }));
            } else if (lastFollowUpQuestion && financialAttempts >= 1) {
              // Generic "Are you sure?" for other cases
              followUpText =
                "Are you sure that's your final answer? Think about compliance requirements.";
              // Mark that next response should end conversation
              setFollowUpAttempts((prev) => ({ ...prev, forceEnd: true }));
            }
          }
        }

        if (followUpText) {
          // Add follow-up question
          setLastFollowUpQuestion(followUpText);
          setTimeout(() => {
            setShowThinking(false);
            const followUpMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: followUpText,
              sender: "character",
            };
            setMessages((prev) => [...prev, followUpMessage]);
            setResponse("");
            setIsSubmitting(false);
          }, 1500); // Increased delay to show thinking animation
        } else {
          // No appropriate follow-up, complete the conversation
          setTimeout(() => {
            setShowThinking(false);
            setConversationComplete(true);
            setIsSubmitting(false);
            // Wait 2 seconds to show the final message before processing
            setTimeout(() => {
              onSubmit(allUserMessages);
            }, 2000);
          }, 1000);
        }
      } else {
        // Conversation complete, evaluate all responses
        const allUserResponses = messages
          .filter((m) => m.sender === "user")
          .map((m) => m.text)
          .concat(responseText)
          .join(" ");
        setConversationComplete(true);
        setIsSubmitting(false);
        // Wait 2 seconds to show the final message before processing
        setTimeout(() => {
          onSubmit(allUserResponses);
        }, 2000);
      }
      
      // Clear the input
      setResponse("");
  };

  return (
    <>
      {/* Listening Overlay */}
      {showListening && (
        <ListeningOverlay 
          scenarioTitle={scenario.title}
          onClose={() => {
            stopListening();
            setShowListening(false);
          }}
        />
      )}
      
      <div className="min-h-screen bg-gray-600 flex flex-col">
        {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 px-4 py-6">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div 
            className="flex items-center gap-4 bg-gray-800 text-white px-6 py-3 rounded-full cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={onBackToMap}
          >
            <h1 className="text-xl font-medium">{scenario.title}</h1>
          </div>

          {/* Total stars display */}
          <div className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-full">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <span className="text-xl font-medium">{totalStars}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-24 pb-32 mt-2">
        <div className="max-w-2xl mx-auto px-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "character" ? (
                  <div className="flex items-end gap-2 max-w-[80%]">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{scenario.character.avatar || '👤'}</span>
                    </div>
                    <div className="bg-blue-500 text-white rounded-3xl rounded-bl-lg px-6 py-4">
                      <p className="text-lg">{message.text}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700 text-white rounded-3xl rounded-br-lg px-6 py-4 max-w-[80%]">
                    <p className="text-lg">{message.text}</p>
                  </div>
                )}
              </div>
            ))}
            {showThinking && <ThinkingIndicator avatar={scenario.character.avatar} />}
            {showSending && <SendingIndicator />}
            {showSpeakAgain && <SpeakAgainButton onClick={handleSpeakAgain} />}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-600 p-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSubmitting) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Speak or write..."
              className="w-full px-6 py-5 pr-16 bg-gray-700 text-white placeholder-gray-400 rounded-full text-lg ring-1 ring-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || conversationComplete}
            />
            <button
              type="button"
              onClick={handleMicrophoneClick}
              disabled={isSubmitting || conversationComplete || isListening}
              className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-50 ${
                isListening ? 'text-white bg-blue-500 rounded-full' : 'text-white hover:bg-white/10 rounded-full'
              }`}
              aria-label="Voice input"
            >
              <Mic className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};
