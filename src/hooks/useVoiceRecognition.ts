import { useState, useEffect, useRef } from 'react';

interface UseVoiceRecognitionOptions {
  onResult: (result: string) => void;
  onError?: (error: any) => void;
}

export const useVoiceRecognition = ({ onResult, onError }: UseVoiceRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR'; // Default to French, can be changed

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      if (transcript) {
        onResult(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (onError) {
        onError(event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onspeechstart = () => {
      console.log('Speech has been detected.');
    };

    recognition.onspeechend = () => {
      console.log('Speech has stopped being detected.');
      stopListening();
    };

    recognitionRef.current = recognition;
  }, [onResult, onError]);

  const startListening = (lang: 'fr-FR' | 'ar-TN' = 'fr-FR') => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, startListening, stopListening };
};