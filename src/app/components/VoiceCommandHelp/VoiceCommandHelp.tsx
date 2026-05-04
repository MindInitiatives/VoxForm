'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const commandExamples = [
  {
    category: 'Transfer Commands', icon: '💸',
    examples: ['Transfer 5000 Naira to John Doe', 'Send 300 euros to account 12345678', 'Bank is GTBank'],
  },
  {
    category: 'Form Navigation', icon: '🧭',
    examples: ['Go to amount field', 'Focus on recipient name', 'Next field'],
  },
  {
    category: 'Actions', icon: '⚡',
    examples: ['Submit the transfer', 'Reset the form', 'Cancel'],
  },
];

export const VoiceCommandHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition w-full cursor-pointer"
      >
        <svg className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
        {isOpen ? 'Hide' : 'Show'} voice command examples
      </button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="mt-3 space-y-2">
          {commandExamples.map((group) => (
            <div key={group.category} className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>{group.icon}</span>
                {group.category}
              </p>
              <ul className="space-y-1">
                {group.examples.map((example) => (
                  <li key={example} className="text-xs text-muted-foreground font-mono leading-relaxed">
                    &quot;{example}&quot;
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
