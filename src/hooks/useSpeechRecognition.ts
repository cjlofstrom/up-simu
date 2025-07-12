import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionProps {
  onTranscript: (text: string) => void;
  silenceTimeout?: number; // in milliseconds
}

export const useSpeechRecognition = ({ 
  onTranscript, 
  silenceTimeout = 2000 
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTranscriptRef = useRef<string>('');

  const startListening = useCallback(() => {
    try {
      setError(null);
      setTranscript('');
      lastTranscriptRef.current = '';

      // Check if speech recognition is supported
      const SpeechRecognition = (window as any).webkitSpeechRecognition || 
                               (window as any).SpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported');
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = lastTranscriptRef.current + finalTranscript + interimTranscript;
        setTranscript(currentTranscript);

        if (finalTranscript) {
          lastTranscriptRef.current += finalTranscript;
        }

        // Reset silence timer on any speech
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Start silence timer
        silenceTimerRef.current = setTimeout(() => {
          stopListening();
        }, silenceTimeout);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Recognition error: ${event.error}`);
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        if (lastTranscriptRef.current.trim()) {
          onTranscript(lastTranscriptRef.current.trim());
        }
      };

      recognition.start();
    } catch (err) {
      setError('Failed to start speech recognition');
      console.error('Error starting speech recognition:', err);
    }
  }, [onTranscript, silenceTimeout]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening
  };
};