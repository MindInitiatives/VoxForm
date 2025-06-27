'use client';

import { motion } from 'framer-motion';
import { SubmissionStatus } from '@/types';

export const TransferConfirmation = ({
  status,
  onClose
}: {
  status: SubmissionStatus;
  onClose: () => void;
}) => {
  if (!status) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-50`}
    >
      <div className={`w-full max-w-md p-6 rounded-lg shadow-xl ${
        status.type === 'success'
          ? 'bg-green-50 text-green-800'
          : status.type === 'error'
          ? 'bg-red-50 text-red-800'
          : 'bg-yellow-50 text-yellow-800'
      }`}>
        <h3 className="text-lg font-medium">
          {status.type === 'success' ? 'Success!' : 'Error'}
        </h3>
        <div className="mt-2">
          <p>{status.message}</p>
          {status.reference && (
            <p className="mt-2 font-mono text-sm">
              Reference: {status.reference}
            </p>
          )}
        </div>
        <div className="mt-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              status.type === 'success'
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : status.type === 'error'
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
};