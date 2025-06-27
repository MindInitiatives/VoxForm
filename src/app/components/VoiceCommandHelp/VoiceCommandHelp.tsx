/* eslint-disable react/no-unescaped-entities */
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const commandExamples = [
  {
    category: 'Transfer Commands',
    examples: [
      "Transfer 5000 Naira to John Doe",
      "Send 300 euros to account 12345678",
      "Bank is GTBank",
    ]
  },
  {
    category: 'Form Navigation',
    examples: [
      "Go to amount field",
      "Focus on recipient name",
      "Next field"
    ]
  },
  {
    category: 'Actions',
    examples: [
      "Submit the transfer",
      "Reset the form",
      "Cancel"
    ]
  }
];

export const VoiceCommandHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        {isOpen ? 'Hide' : 'Show'} voice command examples
        <svg
          className={`ml-1 h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="mt-2 space-y-4">
          {commandExamples.map((group) => (
            <div key={group.category}>
              <h4 className="text-sm font-medium text-gray-900">{group.category}</h4>
              <ul className="mt-1 space-y-1">
                {group.examples.map((example) => (
                  <li key={example} className="text-sm text-gray-600">
                    • "{example}"
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