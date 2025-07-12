import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceRecordingProps {
  onTranscription: (text: string) => void;
  silenceThreshold?: number; // in milliseconds
}

export const useVoiceRecording = ({ 
  onTranscription, 
  silenceThreshold = 2000 
}: UseVoiceRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkAudioLevel = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
    
    // If volume is below threshold, start/continue silence timer
    if (average < 5) { // Threshold for silence
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          stopRecording();
        }, silenceThreshold);
      }
    } else {
      // Reset silence timer if sound detected
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }

    // Continue checking while recording
    if (isRecording) {
      requestAnimationFrame(checkAudioLevel);
    }
  }, [isRecording, silenceThreshold]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analysis for silence detection
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start checking audio levels
      requestAnimationFrame(checkAudioLevel);
    } catch (err) {
      setError('Failed to access microphone');
      console.error('Error accessing microphone:', err);
    }
  }, [checkAudioLevel]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    setIsRecording(false);
  }, []);

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // Using the Web Speech API for transcription
      const recognition = new ((window as any).webkitSpeechRecognition || 
                              (window as any).SpeechRecognition)();
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      // Convert blob to audio for recognition
      const audioUrl = URL.createObjectURL(audioBlob);
      // const audio = new Audio(audioUrl);
      
      // For Web Speech API, we need to use the microphone directly
      // So we'll use a simulated transcription for now
      // In a real app, you'd send this to a transcription service
      
      // Simulate transcription (replace with actual API call)
      setTimeout(() => {
        // This is a placeholder - in production, send audioBlob to a transcription service
        const simulatedText = "This is simulated transcribed text";
        onTranscription(simulatedText);
      }, 500);

      URL.revokeObjectURL(audioUrl);
    } catch (err) {
      setError('Failed to transcribe audio');
      console.error('Transcription error:', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording, stopRecording]);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording
  };
};