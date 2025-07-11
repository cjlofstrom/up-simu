import React, { useState } from "react";
import { Send, User, Star } from "lucide-react";
import { scenarios } from "../data/scenarios";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { gameState } from "../services/gameState";

interface Message {
  id: string;
  text: string;
  sender: "user" | "character";
}

interface ConversationScreenProps {
  scenarioId: string;
  onSubmit: (response: string) => void;
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({
  scenarioId,
  onSubmit,
}) => {
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [followUpAttempts, setFollowUpAttempts] = useState<
    Record<string, number>
  >({});
  const [lastFollowUpQuestion, setLastFollowUpQuestion] = useState<string>("");
  const [showThinking, setShowThinking] = useState(false);
  const scenario = scenarios[scenarioId];

  // Get total stars
  const totalStars = gameState.getTotalStars();

  // Initialize with first question
  React.useEffect(() => {
    setMessages([
      {
        id: "1",
        text: scenario.question,
        sender: "character",
      },
    ]);
  }, [scenario.question]);

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

      // Show thinking indicator
      setShowThinking(true);

      // Track which keywords have been covered across all messages
      const allUserMessages = messages
        .filter((m) => m.sender === "user")
        .map((m) => m.text)
        .concat(response)
        .join(" ");
      const normalizedAllResponses = allUserMessages.toLowerCase();

      const coveredInConversation: string[] = [];
      const yearPattern = /\b(19\d{2}|20\d{2})\b/;
      const hasAttemptedYear = yearPattern.test(allUserMessages);

      scenario.keywords.required.forEach((keyword) => {
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
      const missingKeywords = scenario.keywords.required.filter(
        (kw) => !coveredInConversation.includes(kw),
      );

      // Determine if we should continue conversation
      const hasAllRequiredKeywords = missingKeywords.length === 0;

      if (!conversationComplete && !hasAllRequiredKeywords) {
        let followUpText = "";

        if (scenario.id === "volvo") {
          // Smart follow-up for Volvo scenario
          const hasYear =
            coveredInConversation.includes("1927") ||
            coveredInConversation.includes("year_attempted");
          const hasModel = coveredInConversation.includes("ÖV4");
          const hasInspiration = coveredInConversation.includes("Jakob");

          // Check if we should force end the conversation
          if (followUpAttempts.forceEnd) {
            // End conversation after the retry attempt
            // Don't include the confirmation response in the evaluation
            const previousUserMessages = messages
              .filter((m) => m.sender === "user")
              .map((m) => m.text)
              .join(" ");
            setConversationComplete(true);
            setIsSubmitting(false);
            onSubmit(previousUserMessages);
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
            followUpText =
              "Good, you know the year! But what was the model name and who was it nicknamed after?";
          } else if (hasYear && hasInspiration && !hasModel) {
            followUpText =
              "Great! You know the year and inspiration. What was the model name?";
          } else if (hasYear && hasModel && !hasInspiration) {
            followUpText =
              "Excellent! You know the year and model. Who was it nicknamed after?";
          } else if (!hasYear && !hasModel && hasInspiration) {
            followUpText =
              "Good, you know about Jakob! What year did we start production and what was the model name?";
          } else if (!hasYear && hasModel && !hasInspiration) {
            followUpText =
              "Good, you know the model! What year did we start production and who was it nicknamed after?";
          }

          if (followUpText) {
            // Track attempts for this state
            const newAttempts = followUpAttempts[currentState] || 0;

            // If this is the second attempt at the same state, show retry message
            if (lastFollowUpQuestion && newAttempts === 1) {
              followUpText =
                "Are you sure you remember that correctly? Have one more go";
              // Mark that next response should end conversation
              setFollowUpAttempts((prev) => ({ ...prev, forceEnd: true }));
            } else if (!followUpAttempts.forceEnd) {
              // First attempt - increment counter
              setFollowUpAttempts((prev) => ({
                ...prev,
                [currentState]: newAttempts + 1,
              }));
            }
          }
        } else if (scenario.id === "financial") {
          // Smart follow-up for financial scenario
          const normalizedResponse = response.toLowerCase();
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
            followUpText =
              "Am I talking to the right person? I'm lost. Will call back later.";
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
              // Submit with a special marker for off-topic
              setTimeout(
                () => onSubmit(allUserMessages + " [OFF_TOPIC]"),
                1000,
              );
            }, 1500);
            return;
          } else if (hasCompleteResponse) {
            // Response is complete, end conversation successfully
            setConversationComplete(true);
            setIsSubmitting(false);
            onSubmit(allUserMessages);
            return;
          } else if (followUpAttempts.forceEnd) {
            // This is a confirmation response after "Are you sure?", end conversation
            // Don't include the confirmation response in the evaluation
            const previousUserMessages = messages
              .filter((m) => m.sender === "user")
              .map((m) => m.text)
              .join(" ");
            setConversationComplete(true);
            setIsSubmitting(false);
            onSubmit(previousUserMessages);
            return;
          } else {
            // Response is incomplete, determine what follow-up is needed
            const financialAttempts = followUpAttempts.financial || 0;

            // First check what specific follow-up is needed
            if (needsComplianceExplanation) {
              followUpText =
                "How come? Why not? I thought you were supposed to help me make money!";
              setFollowUpAttempts((prev) => ({
                ...prev,
                financial: financialAttempts + 1,
              }));
            } else if (needsPolicyDetails) {
              followUpText =
                "What about the policies makes this problematic? Can you be more specific?";
              setFollowUpAttempts((prev) => ({
                ...prev,
                financial: financialAttempts + 1,
              }));
            } else if (needsSpecifics) {
              followUpText =
                "But what specific regulations prevent you from giving me tips? I don't understand.";
              setFollowUpAttempts((prev) => ({
                ...prev,
                financial: financialAttempts + 1,
              }));
            } else if (lastFollowUpQuestion && financialAttempts >= 1) {
              // Only show "Are you sure?" if we've already asked for specifics and they still haven't provided them
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
            onSubmit(allUserMessages);
          }, 1000);
        }
      } else {
        // Conversation complete, evaluate all responses
        const allUserResponses = messages
          .filter((m) => m.sender === "user")
          .map((m) => m.text)
          .concat(response)
          .join(" ");
        setConversationComplete(true);
        setIsSubmitting(false);
        onSubmit(allUserResponses);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-600 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 px-4 py-6">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex items-center gap-4 bg-gray-800 text-white px-6 py-3 rounded-full">
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
              className="w-full px-6 py-5 pr-16 bg-gray-700 text-white placeholder-gray-400 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || conversationComplete}
            />
            <button
              type="submit"
              disabled={
                !response.trim() || isSubmitting || conversationComplete
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Send message"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
