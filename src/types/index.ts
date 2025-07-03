export type FormField = {
  name: string;
  value: string | number | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: () => void;
  error?: string;
  type?: 'text' | 'number' | 'select' | 'checkbox' | 'date';
  options?: { value: string; label: string }[];
  required?: boolean;
  active?: boolean;
  onFocus?: () => void;
};

export type TransferFormData = {
  recipientName: string;
  recipientAccount: string;
  bankName: string;
  amount: number | string;
  currency: string;
  reference: string;
  transferDate: string;
  termsAccepted: boolean;
};

export type FormErrors = {
  [key in keyof TransferFormData]?: string;
};

export type SubmissionStatus = {
  type: 'success' | 'error' | 'warning';
  message: string;
  reference?: string;
} | null;



// Form Types
export type FormState = {
  recipientName: string;
  recipientAccount: string;
  bankName: string;
  amount: string;
  currency: string;
  reference: string;
  transferDate: string;
  termsAccepted: boolean;
};

export interface ProcessResult {
  fieldUpdates?: Partial<FormState>;
  confirmation?: string;
  // confirmation?: {
  //   prompt: string;
  //   successResponse?: string;
  //   cancelResponse?: string;
  //   action: () => Promise<void>;
  // };
  intent?: string;
  requiresConfirmation?: boolean;
  error?: string;
}

// API Types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
};

// Voice Command Types
export type VoiceCommand = {
  command: string;
  timestamp: string;
  status: 'processing' | 'success' | 'error';
  result?: {
    fieldUpdates?: Partial<FormState>;
    confirmation?: string;
  };
  error?: string;
};

// Field Option Type
export type FieldOption = {
  value: string;
  label: string;
};