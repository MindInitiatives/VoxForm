/* eslint-disable react/no-unescaped-entities */
'use client';

import { useFormState } from '@/hooks/useFormState';
import { useEffect, useRef } from 'react';
import { FormField } from '../FormField/FormField';
import { useVoice } from '@/app/providers/VoiceProvider/VoiceProvider';
import { TransferConfirmation } from '../TransferConfirmation/TransferConfirmation';
import { HistoryPanel } from '../HistoryPanel/HistoryPanel';
import { VoiceCommandHelp } from '../VoiceCommandHelp/VoiceCommandHelp';
import { MicrophoneButton } from '../MicrophoneButton/MicrophoneButton';

const BankTransferForm = () => {
  const {
    formState,
    updateField,
    validateField,
    validateAll,
    resetForm,
    errors,
    isSubmitting,
    submissionStatus,
  } = useFormState({
    recipientName: '',
    recipientAccount: '',
    bankName: '',
    amount: '',
    currency: 'NGN',
    reference: '',
    transferDate: new Date().toISOString().split('T')[0],
    termsAccepted: false,
  });

  const {
    transcription,
    transcriptionError,
    speak,
    commandHistory,
    activeField,
    setActiveField,
  } = useVoice();

  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      speak("Please fix the errors in the form before submitting.");
      return;
    }
    
    // Additional security validation
    if (Number(formState.amount) > 10000) {
      speak("Large transfers require additional verification. Please contact support.");
      return;
    }
  };

  // Auto-focus on active field
  useEffect(() => {
    if (activeField && formRef.current) {
      const field = formRef.current.querySelector(`[name="${activeField}"]`);
      if (field) (field as HTMLElement).focus();
    }
  }, [activeField]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
      {/* Form Section */}
      <div className="lg:col-span-2 p-8">
        <form 
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-6"
          aria-label="Bank transfer form"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Recipient Full Name"
              name="recipientName"
              value={formState.recipientName}
              onChange={(e) => updateField('recipientName', e.target.value)}
              onBlur={() => validateField('recipientName')}
              error={errors.recipientName}
              type="text"
              required
              active={activeField === 'recipientName'}
              onFocus={() => setActiveField('recipientName')}
            />
            
            <FormField
              label="Account Number"
              name="recipientAccount"
              value={formState.recipientAccount}
              onChange={(e) => updateField('recipientAccount', e.target.value)}
              onBlur={() => validateField('recipientAccount')}
              error={errors.recipientAccount}
              type="text"
              required
              active={activeField === 'recipientAccount'}
              onFocus={() => setActiveField('recipientAccount')}
            />
            
            <FormField
              label="Bank Name"
              name="bankName"
              value={formState.bankName}
              onChange={(e) => updateField('bankName', e.target.value)}
              onBlur={() => validateField('bankName')}
              error={errors.bankName}
              type="text"
              required
              active={activeField === 'bankName'}
              onFocus={() => setActiveField('bankName')}
            />
            
            <div className="flex space-x-4">
              <FormField
                label="Amount"
                name="amount"
                value={formState.amount}
                onChange={(e) => updateField('amount', e.target.value)}
                onBlur={() => validateField('amount')}
                error={errors.amount}
                type="number"
                min="0.01"
                step="0.01"
                required
                active={activeField === 'amount'}
                onFocus={() => setActiveField('amount')}
                className="flex-1"
              />
              
              <FormField
                label="Currency"
                name="currency"
                value={formState.currency}
                onChange={(e) => updateField('currency', e.target.value)}
                type="select"
                options={[
                  { value: 'NGN', label: 'NGN' },
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                  { value: 'GBP', label: 'GBP' },
                  { value: 'JPY', label: 'JPY' },
                ]}
                className="w-24"
              />
            </div>
            
            <FormField
              label="Reference"
              name="reference"
              value={formState.reference}
              onChange={(e) => updateField('reference', e.target.value)}
              type="text"
              active={activeField === 'reference'}
              onFocus={() => setActiveField('reference')}
            />
            
            <FormField
              label="Transfer Date"
              name="transferDate"
              value={formState.transferDate}
              onChange={(e) => updateField('transferDate', e.target.value)}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              active={activeField === 'transferDate'}
              onFocus={() => setActiveField('transferDate')}
            />
          </div>
          
          <FormField
            label="I agree to the terms and conditions and confirm this transfer is legitimate"
            name="termsAccepted"
            value={formState.termsAccepted}
            onChange={(e) => updateField('termsAccepted', e.target.value)}
            onBlur={() => validateField('termsAccepted')}
            error={errors.termsAccepted}
            type="checkbox"
            required
          />
          
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
              }`}
              aria-label="Submit transfer"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Submit Transfer'}
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 shadow hover:shadow-md transition-all"
              aria-label="Reset form"
            >
              Reset Form
            </button>
          </div>
        </form>
        
        {submissionStatus && (
          <TransferConfirmation 
            status={submissionStatus}
            onClose={() => {}}
          />
        )}
      </div>
      
      {/* Voice Control Section */}
      <div className="bg-gray-50 p-8 border-l border-gray-200">
        <div className="sticky top-8 space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Voice Controls</h2>
            
            <div className="space-y-4">
              <MicrophoneButton />
              
              {transcriptionError && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
                  <p>{transcriptionError}</p>
                  <button 
                    onClick={() => {}}
                    className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {transcription && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">You said:</p>
                  <p className="text-blue-900">"{transcription}"</p>
                </div>
              )}
            </div>
          </div>
          
          <HistoryPanel commands={commandHistory} />
          
          <VoiceCommandHelp />
        </div>
      </div>
    </div>
  );
};

export default BankTransferForm;