'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { processVoiceCommand } from '@/lib/nlp/processor';
import { VoiceCommand, TransferFormData } from '@/types';
import { VOICE_CONFIG } from '@/config/voice';


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
  activeFieldValue: string | boolean | null;
  setActiveFieldValue: (value: string | boolean | null) => void;
  // New confirmation state
  confirmationState: {
    isConfirming: boolean;
    prompt: string;
    confirm: () => void;
    cancel: () => void;
    onConfirm: (callback: () => Promise<void>) => void;
    onCancel: (callback: () => Promise<void>) => void;
  };
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
  const confirmationCallbacksRef = useRef<{
    onConfirm: (() => Promise<void>) | null;
    onCancel: (() => Promise<void>) | null;
  }>({ onConfirm: null, onCancel: null });

  // Confirmation state
  const [confirmationPrompt, setConfirmationPrompt] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

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
  const [activeFieldValue, setActiveFieldValue] = useState<string | null | boolean>(null);

  // New confirmation functions
  const requestConfirmation = useCallback(async (
    prompt: string,
    onConfirm: () => Promise<void>,
    onCancel: () => Promise<void>
  ): Promise<void> => {
    confirmationCallbacksRef.current = { onConfirm, onCancel };
    setConfirmationPrompt(prompt);
    setIsConfirming(true);
    await speak(prompt);
  }, [speak]);

  const confirmAction = useCallback(async () => {
    if (confirmationCallbacksRef.current.onConfirm) {
      await confirmationCallbacksRef.current.onConfirm();
    }
    setIsConfirming(false);
    setConfirmationPrompt('');
  }, []);

  const cancelAction = useCallback(async () => {
    if (confirmationCallbacksRef.current.onCancel) {
      await confirmationCallbacksRef.current.onCancel();
    }
    setIsConfirming(false);
    setConfirmationPrompt('');
  }, []);


  const transferFormFields: Record<keyof TransferFormData, string> = {
    amount: '',
    currency: '',
    recipientName: '',
    recipientAccount: '',
    bankName: '',
    reference: '',
    transferDate: '',
    termsAccepted: ''
  };

  // Enhanced command processor with confirmation flow
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
      
      // Set active field based on command result
      // Process all field updates
      if (result.fieldUpdates) {
        const fieldEntries = Object.entries(result.fieldUpdates);
        
        // Set values and focus on each field sequentially
        for (const [field, value] of fieldEntries) {
          if (field in transferFormFields) {
            // Set focus to this field
            setActiveField(field);
            setActiveFieldValue(value);
            
            // Small delay between fields for better UX
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }

      if (result.requiresConfirmation) {
        await requestConfirmation(
          result.confirmation || VOICE_CONFIG.responses.confirmation
            .replace('{amount}', result.fieldUpdates?.amount ?? '')
            .replace('{currency}', result.fieldUpdates?.currency ?? '')
            .replace('{recipient}', result.fieldUpdates?.recipientName ?? ''),
          async () => {
            // What to do on confirm
            await speak(result.confirmation || VOICE_CONFIG.responses.confirmed);
          },
          async () => {
            // What to do on cancel
            await speak(VOICE_CONFIG.responses.cancelled);
          }
        );
      } 
      else {
        await speak(result.confirmation || '');
      }
    } catch (error) {
      console.error('Error processing command:', error);
      setCommandHistory(prev => prev.map(cmd => 
        cmd.timestamp === newCommand.timestamp
          ? { ...cmd, status: 'error', error: 'Failed to process command' }
          : cmd
      ));
      await speak(VOICE_CONFIG.responses.error);
    } finally {
        // Add a small delay before allowing the next command
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 500);
    }
  }, [speak, requestConfirmation]);

  // Handle voice responses during confirmation
  useEffect(() => {
    if (isConfirming && transcription) {
      const normalized = transcription.toLowerCase();
      const confirmWords = [...VOICE_CONFIG.commands.submit, 'yes'];
      const cancelWords = [...VOICE_CONFIG.commands.cancel, 'no'];
      
      if (confirmWords.some(word => normalized.includes(word))) {
        confirmAction();
      } else if (cancelWords.some(word => normalized.includes(word))) {
        cancelAction();
      } else {
        // Unrecognized response during confirmation
        speak(VOICE_CONFIG.responses.retryPrompt);
      }
    }
  }, [transcription, isConfirming, confirmAction, cancelAction, speak]);

  // Process transcription only when recording stops and we have a transcription
  useEffect(() => {
    if (!isRecording && transcription && !isConfirming) {
      const process = async () => {
        await processCommand(transcription);
      };
      process();
    }
  }, [isRecording, transcription]); // Remove isConfirming from dependencies

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
    activeFieldValue,
    setActiveFieldValue,
    confirmationState: {
      isConfirming,
      prompt: confirmationPrompt,
      confirm: confirmAction,
      cancel: cancelAction,
      onConfirm: (callback: () => Promise<void>) => {
        confirmationCallbacksRef.current.onConfirm = callback;
      },
      onCancel: (callback: () => Promise<void>) => {
        confirmationCallbacksRef.current.onCancel = callback;
      },
    },
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
    activeFieldValue,
    isConfirming,
    confirmationPrompt,
    confirmAction,
    cancelAction,
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