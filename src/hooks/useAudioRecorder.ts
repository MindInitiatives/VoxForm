/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { VOICE_CONFIG } from '@/config/voice';



// Type for speech recognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

type SpeechRecognition = {
  new (): SpeechRecognitionInstance;
  prototype: SpeechRecognitionInstance;
};

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

const getSpeechRecognition = (): SpeechRecognition | null => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognitionInstance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setTranscriptionError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = VOICE_CONFIG.settings.language;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setTranscription(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setTranscriptionError(`Recognition error: ${event.error}`);
    };

    setSpeechRecognition(recognition);

    return () => {
      recognition.stop();
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setTranscription('');
      setTranscriptionError(null);
      setAudioChunks([]);

      // Start browser speech recognition if available
      if (speechRecognition) {
        speechRecognition.start();
        setIsRecording(true);
        return;
      }

      // Fallback to manual recording if no speech recognition
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      // Audio analysis setup
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(audioCtx);
      
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 32;
      setAnalyser(analyserNode);
      
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyserNode);

      // Handle data available
      recorder.ondataavailable = (e) => {
        setAudioChunks((prev) => [...prev, e.data]);
      };

      // Start recording
      recorder.start(100); // Collect data every 100ms

      // Audio level monitoring
      const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
      const checkLevel = () => {
        analyserNode.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(avg / 255);
        if (isRecording) requestAnimationFrame(checkLevel);
      };
      checkLevel();

      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setTranscriptionError('Microphone access denied. Please check permissions.');
    }
  }, [isRecording, speechRecognition]);

  const stopRecording = useCallback(async () => {
    // Stop speech recognition if active
    if (speechRecognition) {
      console.log(speechRecognition);
      
      speechRecognition.stop();
      setIsRecording(false);
      return;
    }

    // Stop manual recording if active
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop all tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      // Process audio chunks if using manual recording
      if (audioChunks.length > 0) {
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const transcript = await transcribeAudio(audioBlob);
          setTranscription(transcript);
        } catch (err) {
          console.error('Transcription error:', err);
          setTranscriptionError('Failed to transcribe audio. Please try again.');
        }
      }
    }
  }, [mediaRecorder, audioChunks, speechRecognition]);

  // Function to send audio to a real STT API
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    // Here you would integrate with a real speech-to-text API
    // Example using a hypothetical API endpoint:
    /*
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('language', VOICE_CONFIG.settings.language);

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Transcription failed');
    }

    const data = await response.json();
    return data.transcript;
    */

    // Fallback using Web Speech API if no backend available
    return new Promise((resolve) => {
      // Extend window type to include SpeechRecognition and webkitSpeechRecognition
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        console.log(SpeechRecognitionConstructor);
        
      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.lang = VOICE_CONFIG.settings.language;
        recognition.onresult = (result: SpeechRecognitionResult) => {
          console.log(result);
          
          const transcript = Array.from(result)
            // .map((result: SpeechRecognitionResult) => result[0])
            .map((result: SpeechRecognitionAlternative) => result.transcript)
            .join('');
          resolve(transcript);
        };
        recognition.onerror = () => resolve('');
        recognition.start();
      } else {
        resolve('');
      }
    });
  };

  const retryTranscription = useCallback(() => {
    setTranscription('');
    setTranscriptionError(null);
    startRecording();
  }, [startRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechRecognition) {
        speechRecognition.stop();
      }
      if (mediaRecorder) {
        mediaRecorder.stream?.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [mediaRecorder, audioContext, speechRecognition]);

  return {
    isRecording,
    audioLevel,
    startRecording,
    stopRecording,
    transcription,
    transcriptionError,
    retryTranscription
  };
};