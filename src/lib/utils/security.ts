import { TransferFormData } from '@/types';

export const sanitizeInput = (data: any): TransferFormData => {
  const sanitized: any = {};
  
  for (const key in data) {
    if (typeof data[key] === 'string') {
      // Basic XSS protection
      sanitized[key] = data[key]
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .trim();
    } else {
      sanitized[key] = data[key];
    }
  }
  
  return sanitized as TransferFormData;
};

export const validateCsrfToken = (token: string): boolean => {
  // In production, validate against session token
  return !!token;
};

export const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const sanitizeAmount = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.]/g, ''));
};