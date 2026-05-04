'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { VoiceCommand } from '@/types';
import moment from 'moment';

export const HistoryPanel = ({ commands }: { commands: VoiceCommand[] }) => {
  const formatTime = (timestamp: string) =>
    moment.unix(Number(timestamp)).format('h:mm:ss a');

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Command History
      </p>
      <div className="space-y-1.5 max-h-52 overflow-y-auto">
        <AnimatePresence initial={false}>
          {commands.length === 0 ? (
            <p className="text-xs text-muted-foreground/50 italic py-2">No commands yet</p>
          ) : (
            [...commands].reverse().map((cmd) => (
              <motion.div
                key={cmd.timestamp}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className={`rounded-lg border px-3 py-2.5 text-xs
                  ${cmd.status === 'success'
                    ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                    : cmd.status === 'error'
                    ? 'border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 text-red-700 dark:text-red-300'
                    : 'border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/5 text-indigo-700 dark:text-indigo-300'
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium leading-snug truncate">&quot;{cmd.command}&quot;</span>
                  <span className="text-[10px] opacity-50 tabular-nums flex-shrink-0 mt-0.5">
                    {formatTime(cmd.timestamp)}
                  </span>
                </div>
                {cmd.result?.confirmation && (
                  <p className="mt-1 opacity-70 leading-snug">✓ {cmd.result.confirmation}</p>
                )}
                {cmd.error && <p className="mt-1 opacity-70">✗ {cmd.error}</p>}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
