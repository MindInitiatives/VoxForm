'use client';

import { motion } from 'framer-motion';

export const AudioVisualizer = ({ level }: { level: number }) => {
  const bars = Array(12).fill(0).map((_, i) => {
    const height = Math.max(4, level * 100 * Math.random());
    return (
      <motion.div
        key={i}
        animate={{
          height: `${height}%`,
          opacity: level > 0.1 ? 1 : 0.6
        }}
        transition={{
          duration: 0.2,
          ease: 'easeOut'
        }}
        className="w-1 bg-indigo-500 rounded-full"
        style={{ height: `${height}%` }}
      />
    );
  });

  return (
    <div className="flex items-end justify-center h-16 gap-1 px-4 py-2">
      {bars}
      <motion.div 
        animate={{ scale: level > 0 ? [1, 1.1, 1] : 1 }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="flex items-center justify-center ml-3 text-indigo-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </motion.div>
    </div>
  );
};