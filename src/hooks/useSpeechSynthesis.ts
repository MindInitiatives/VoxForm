import { useState, useEffect } from 'react';

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Prefer a natural-sounding voice
      const preferredVoice = availableVoices.find(v => 
        v.lang.includes('en') && v.name.includes('Natural')
      ) || availableVoices[0];
      
      setSelectedVoice(preferredVoice);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = (text: string, options: {
    rate?: number;
    pitch?: number;
    voice?: SpeechSynthesisVoice;
  } = {}) => {
    return new Promise<void>((resolve) => {
      if (!window.speechSynthesis) {
        console.error('Speech synthesis not supported');
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = options.voice || selectedVoice || voices[0];
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  return { 
    speak, 
    isSpeaking, 
    voices, 
    selectedVoice, 
    setSelectedVoice 
  };
};