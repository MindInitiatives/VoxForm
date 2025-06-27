/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { TransferFormData, FormErrors, SubmissionStatus } from '@/types';
import { validateTransferRequest } from '@/lib/utils/validation';

export const useFormState = (initialState: TransferFormData) => {
  const [formState, setFormState] = useState<TransferFormData>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>(null);

  const updateField = (field: keyof TransferFormData, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateField = (field: keyof TransferFormData) => {
    const fieldErrors = validateTransferRequest(formState);
    setErrors(fieldErrors.errors);
    return !fieldErrors.errors[field];
  };

  const validateAll = () => {
    const newErrors = validateTransferRequest(formState);
    setErrors(newErrors.errors);
    return Object.keys(newErrors.errors).length === 0;
  };

  const resetForm = () => {
    setFormState(initialState);
    setErrors({});
    setSubmissionStatus(null);
  };

  return {
    formState,
    updateField,
    validateField,
    validateAll,
    errors,
    resetForm,
    isSubmitting,
    submissionStatus,
    setSubmissionStatus,
    setIsSubmitting
  };
};