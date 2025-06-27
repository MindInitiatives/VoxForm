'use client';

import { motion } from 'framer-motion';
import { fadeIn, pulse } from '@/lib/utils/animations';
import { useVoice } from '@/app/providers/VoiceProvider/VoiceProvider';

export const MicrophoneButton = () => {
  const { 
    isRecording, 
    startRecording, 
    stopRecording,
    transcriptionError,
    retryTranscription,
  } = useVoice();

  return (
    <div className="space-y-4">
      <motion.button
        onClick={isRecording ? stopRecording : startRecording}
        initial="hidden"
        animate="visible"
        variants={isRecording ? pulse : fadeIn}
        className={`relative flex items-center justify-center w-full py-4 px-6 rounded-xl font-medium text-white transition-all ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 shadow-lg' 
            : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
        }`}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <span className="flex items-center">
          {isRecording ? (
            <>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Listening... (Click to stop)
            </>
          ) : (
            <>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Tap to speak
            </>
          )}
        </span>
      </motion.button>

      {transcriptionError && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700"
        >
          <p>{transcriptionError}</p>
          <button 
            onClick={retryTranscription}
            className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
          >
            Retry
          </button>
        </motion.div>
      )}
    </div>
  );
};