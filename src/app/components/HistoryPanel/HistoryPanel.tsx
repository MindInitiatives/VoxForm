/* eslint-disable react/no-unescaped-entities */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { VoiceCommand } from '@/types';
import moment from 'moment';


export const HistoryPanel = ({ commands }: { commands: VoiceCommand[] }) => {
  const momentTime = (timestamp: string) => {
    console.log(timestamp);
    
    return moment.unix(Number(timestamp)).format('h:mm:ss a');
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900">Command History</h3>
      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
        <AnimatePresence>
          {commands.length === 0 ? (
            <p className="text-sm text-gray-500">No commands yet</p>
          ) : (
            commands.map((cmd) => (
              <motion.div
                key={cmd.timestamp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3 text-sm rounded-md ${
                  cmd.status === 'success'
                    ? 'bg-green-50 text-green-800'
                    : cmd.status === 'error'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-blue-50 text-blue-800'
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">"{cmd.command}"</span>
                  <span className="text-xs opacity-70">
                    {momentTime(cmd.timestamp)}
                  </span>
                </div>
                {cmd.result?.confirmation && (
                  <p className="mt-1">✓ {cmd.result.confirmation}</p>
                )}
                {cmd.error && <p className="mt-1">✗ {cmd.error}</p>}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};