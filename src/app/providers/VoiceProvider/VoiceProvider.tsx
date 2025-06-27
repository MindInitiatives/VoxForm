'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { processVoiceCommand } from '@/lib/nlp/processor';
import { VoiceCommand } from '@/types';

type VoiceContextType = {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  transcription: string;
  transcriptionError: string | null;
  retryTranscription: () => void;
  speak: (text: string, language?: string) => Promise<void>;
  commandHistory: VoiceCommand[];
  processVoiceCommand: (command: string) => Promise<void>;
  activeField: string | null;
  setActiveField: (field: string | null) => void;
};

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    isRecording,
    startRecording,
    stopRecording,
    transcription,
    transcriptionError,
    retryTranscription,
  } = useAudioRecorder();
  
  const { speak: baseSpeak } = useSpeechSynthesis();
  const isMountedRef = useRef(true);
  const lastCommandTimeRef = useRef(0);
  const isProcessingRef = useRef(false);

  // Stable speak function
  const speak = useCallback(async (text: string, language?: string): Promise<void> => {
    if (!text.trim()) return;
    await baseSpeak(text, { 
      voice: language ? window.speechSynthesis.getVoices()
        .find(v => v.lang.startsWith(language)) : undefined
    });
  }, [baseSpeak]);

  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [activeField, setActiveField] = useState<string | null>(null);

  // Process command when recording stops
  const processCommand = useCallback(async (command: string): Promise<void> => {
    if (!command.trim() || isProcessingRef.current) return;

    const now = Date.now();
    if (now - lastCommandTimeRef.current < 1000) { // 1 second cooldown
      return;
    }

    isProcessingRef.current = true;
    lastCommandTimeRef.current = now;

    const newCommand: VoiceCommand = {
      command,
      timestamp: now.toString(),
      status: 'processing',
    };

    try {
      setCommandHistory(prev => [...prev.slice(-9), newCommand]);
      
      const result = await processVoiceCommand(command);
      
      setCommandHistory(prev => prev.map(cmd => 
        cmd.timestamp === newCommand.timestamp
          ? { ...cmd, status: 'success', result }
          : cmd
      ));
      
      if (result.confirmation) {
        await speak(result.confirmation);
      }
    } catch (error) {
      console.error('Error processing command:', error);
      setCommandHistory(prev => prev.map(cmd => 
        cmd.timestamp === newCommand.timestamp
          ? { ...cmd, status: 'error', error: 'Failed to process command' }
          : cmd
      ));
      await speak("Sorry, I couldn't process that. Please try again.");
    } finally {
      isProcessingRef.current = false;
    }
  }, [speak]);

  // Process transcription only when recording stops and we have a transcription
  useEffect(() => {
    if (!isRecording && transcription) {
      processCommand(transcription);
    }
  }, [isRecording, transcription]); // Only run when recording state or transcription changes

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoize context value
  const contextValue = useMemo(() => ({
    isRecording,
    startRecording,
    stopRecording,
    transcription,
    transcriptionError,
    retryTranscription,
    speak,
    commandHistory,
    processVoiceCommand: processCommand,
    activeField,
    setActiveField,
  }), [
    isRecording,
    startRecording,
    stopRecording,
    transcription,
    transcriptionError,
    retryTranscription,
    speak,
    commandHistory,
    processCommand,
    activeField,
  ]);

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};