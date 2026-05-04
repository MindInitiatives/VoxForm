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
        className={`relative flex items-center justify-center w-full py-3.5 px-5 rounded-xl font-medium text-sm transition-all cursor-pointer
          ${isRecording
            ? 'bg-red-500/15 border border-red-500/30 text-red-300 shadow-lg shadow-red-500/5'
            : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50'
          }`}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {/* Pulse ring when recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-xl animate-ping bg-red-500/10 pointer-events-none" />
        )}
        
        <span className="flex items-center gap-2.5 relative z-10">
          {isRecording ? (
            <>
              {/* Stop icon */}
              <span className="w-4 h-4 rounded-sm bg-red-400 flex-shrink-0" />
              <span>Listening… tap to stop</span>
              <span className="ml-auto flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-0.5 h-4 bg-red-400 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
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