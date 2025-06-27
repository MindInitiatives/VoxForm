import { TransferFormData, ApiResponse } from '@/types';
import { sanitizeAmount } from './security';

/**
 * Validates a bank transfer request with multiple security checks
 */
export const validateTransferRequest = (
  data: Partial<TransferFormData>
): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: TransferFormData | null;
} => {
  const errors: Record<string, string> = {};
  let isValid = true;

  // 1. Validate required fields
  const requiredFields: Array<keyof TransferFormData> = [
    'recipientName',
    'recipientAccount',
    'bankName',
    'amount',
    'termsAccepted'
  ];

  requiredFields.forEach((field) => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors[field] = `${fieldToLabel(field)} is required`;
      isValid = false;
    }
  });

  // 2. Validate field formats
  if (data.recipientName && !/^[a-zA-Z\s\-']{3,100}$/.test(data.recipientName)) {
    errors.recipientName = 'Invalid recipient name format';
    isValid = false;
  }

  if (data.recipientAccount && !/^\d{8,20}$/.test(data.recipientAccount)) {
    errors.recipientAccount = 'Account must be 8-20 digits';
    isValid = false;
  }

  if (data.bankName && data.bankName.length < 3) {
    errors.bankName = 'Bank name too short';
    isValid = false;
  }

  // 3. Validate amount
  let sanitizedAmount: number | null = null;
  if (data.amount) {
    try {
      sanitizedAmount = sanitizeAmount(data.amount.toString());
      if (isNaN(sanitizedAmount)) {
        errors.amount = 'Invalid amount';
        isValid = false;
      } else if (sanitizedAmount <= 0) {
        errors.amount = 'Amount must be positive';
        isValid = false;
      } else if (sanitizedAmount > 100000) {
        errors.amount = 'Maximum transfer amount is $100,000';
        isValid = false;
      } else if (sanitizedAmount < 1) {
        errors.amount = 'Minimum transfer amount is $1';
        isValid = false;
      }
    } catch (error) {
      errors.amount = 'Invalid amount format';
      isValid = false;
    }
  }

  // 4. Validate currency
  const validCurrencies = ['NGN', 'USD', 'EUR', 'GBP', 'JPY'];
  if (data.currency && !validCurrencies.includes(data.currency)) {
    errors.currency = 'Invalid currency';
    isValid = false;
  }

  // 5. Validate terms
  if (data.termsAccepted !== true) {
    errors.termsAccepted = 'You must accept the terms';
    isValid = false;
  }

  // 6. Validate transfer date if provided
  if (data.transferDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const transferDate = new Date(data.transferDate);
    
    if (isNaN(transferDate.getTime())) {
      errors.transferDate = 'Invalid date format';
      isValid = false;
    } else if (transferDate < today) {
      errors.transferDate = 'Date cannot be in the past';
      isValid = false;
    }
  }

  // Prepare sanitized data if valid
  let sanitizedData: TransferFormData | null = null;
  if (isValid && sanitizedAmount !== null) {
    sanitizedData = {
      recipientName: data.recipientName!.trim(),
      recipientAccount: data.recipientAccount!.trim(),
      bankName: data.bankName!.trim(),
      amount: sanitizedAmount.toFixed(2),
      currency: data.currency || 'NGN',
      reference: data.reference?.trim() || '',
      transferDate: data.transferDate || new Date().toISOString().split('T')[0],
      termsAccepted: true // Already validated
    };
  }

  return { isValid, errors, sanitizedData };
};

/**
 * Formats field names for error messages
 */
const fieldToLabel = (field: string): string => {
  const labels: Record<string, string> = {
    recipientName: 'Recipient name',
    recipientAccount: 'Account number',
    bankName: 'Bank name',
    amount: 'Amount',
    currency: 'Currency',
    termsAccepted: 'Terms acceptance'
  };
  return labels[field] || field;
};

/**
 * Validates API response structure
 */
export const validateApiResponse = (response: any): response is ApiResponse => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    typeof response.success === 'boolean'
  );
};

/**
 * Special validation for voice confirmation commands
 */
export const validateConfirmationCommand = (command: string): boolean => {
  const confirmWords = ['confirm', 'yes', 'proceed', 'approve', 'authorize'];
  const cancelWords = ['cancel', 'no', 'stop', 'abort', 'reject'];
  
  const normalized = command.toLowerCase();
  return confirmWords.some(word => normalized.includes(word)) && 
         !cancelWords.some(word => normalized.includes(word));
};