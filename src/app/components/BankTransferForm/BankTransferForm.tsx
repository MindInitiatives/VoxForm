'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormState } from '@/hooks/useFormState';
import { useEffect, useRef } from 'react';
import { useVoice } from '@/app/providers/VoiceProvider/VoiceProvider';
import { TransferConfirmation } from '../TransferConfirmation/TransferConfirmation';
import { HistoryPanel } from '../HistoryPanel/HistoryPanel';
import { VoiceCommandHelp } from '../VoiceCommandHelp/VoiceCommandHelp';
import { MicrophoneButton } from '../MicrophoneButton/MicrophoneButton';
import { apiClient } from '@/lib/api/client';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Define Zod schema
const transferFormSchema = z.object({
  recipientName: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Invalid characters in name"),
  
  recipientAccount: z.string()
    .min(8, "Account must be at least 8 digits")
    .max(20, "Account must be less than 20 digits")
    .regex(/^\d+$/, "Account must contain only numbers"),
  
  bankName: z.string()
    .min(3, "Bank name must be at least 3 characters"),
  
  amount: z.string()
    // .transform(val => parseFloat(val))
    // .refine(val => !isNaN(val), "Invalid amount")
    // .refine(val => val > 0, "Amount must be positive")
    // .refine(val => val <= 100000, "Maximum transfer is $100,000")
    // .refine(val => val >= 1, "Minimum transfer is $1")
    ,
  
  currency: z.enum(["NGN", "USD", "EUR", "GBP", "JPY"]),
  
  reference: z.string().optional(),
  
  transferDate: z.string()
    .refine(val => new Date(val) >= new Date(new Date().setHours(0, 0, 0, 0)), 
      "Date cannot be in the past"),
  
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" })
  })
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

const BankTransferForm = () => {
  const {
    resetForm,
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
    activeFieldValue,
    confirmationState,
  } = useVoice();

  const formRef = useRef<HTMLFormElement>(null);

  // Initialize react-hook-form
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      recipientName: '',
      recipientAccount: '',
      bankName: '',
      amount: '',
      currency: 'NGN',
      reference: '',
      transferDate: format(new Date(), 'yyyy-MM-dd'),
      termsAccepted: true
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await form.trigger();
    if (!isValid) {
      speak("Please fix the errors in the form before submitting.");
      return;
    }
    
    const values = form.getValues();
    
    // Additional security validation
    if (Number(values.amount) > 10000) {
      speak("Large transfers require additional verification. Please contact support.");
      return;
    }

    try {
        confirmationState.onConfirm(async () => {
          const response = await apiClient.post('/transfer', values);
          console.log(response);
          // Handle successful submission

        });
    } catch (error) {
      console.error("Transfer failed:", error);
      // Handle error
    }
  };

  // Auto-focus on active field
  useEffect(() => {
    console.log(activeField, activeFieldValue);
    
    if (activeField && formRef.current) {
      const field = formRef.current.querySelector(`[name="${activeField}"]`);
      if (field) (field as HTMLElement).focus();
      // If activeFieldValue is an object with multiple fields, set them all
      if (activeFieldValue && typeof activeFieldValue === 'object' && !Array.isArray(activeFieldValue)) {
        Object.entries(activeFieldValue).forEach(([key, value]) => {
          form.setValue(key as keyof TransferFormValues, value as any);
        });
      } else if (activeField && activeFieldValue !== undefined) {
        // Otherwise, set only the active field
        form.setValue(activeField as keyof TransferFormValues, activeFieldValue as any);
      }
    }
  }, [activeField, activeFieldValue]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
      {/* Form Section */}
      <div className="lg:col-span-2 p-8">
        <Form {...form}>
          <form 
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-label="Bank transfer form"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipient Name */}
              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field}
                        onFocus={() => setActiveField('recipientName')}
                        className={form.formState.errors.recipientName && "border-destructive"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Account Number */}
              <FormField
                control={form.control}
                name="recipientAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1234567890" 
                        {...field}
                        onFocus={() => setActiveField('recipientAccount')}
                        className={form.formState.errors.recipientAccount && "border-destructive"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Bank Name */}
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Bank Name" 
                        {...field}
                        onFocus={() => setActiveField('bankName')}
                        className={form.formState.errors.bankName && "border-destructive"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Amount and Currency */}
              <div className="flex space-x-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                          {...field}
                          onFocus={() => setActiveField('amount')}
                          className={form.formState.errors.amount && "border-destructive"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormLabel>Currency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        onOpenChange={(open) => open && setActiveField('currency')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NGN">NGN</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Reference */}
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Optional reference" 
                        {...field}
                        onFocus={() => setActiveField('reference')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Transfer Date */}
              <FormField
                control={form.control}
                name="transferDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Transfer Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                              form.formState.errors.transferDate && "border-destructive"
                            )}
                            onClick={() => setActiveField('transferDate')}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(field.value)}
                          onSelect={(date) => {
                            field.onChange(format(date || new Date(), "yyyy-MM-dd"));
                            setActiveField('transferDate');
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Terms Accepted */}
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      onFocus={() => setActiveField('termsAccepted')}
                      className={form.formState.errors.termsAccepted ? "border-destructive" : ""}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the terms and conditions and confirm this transfer is legitimate
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Form Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3"
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
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  resetForm();
                }}
                className="px-6 py-3"
              >
                Reset Form
              </Button>
            </div>
          </form>
        </Form>
        
        {submissionStatus && (
          <TransferConfirmation 
            status={submissionStatus}
            onClose={() => {}}
          />
        )}
      </div>
      
      {/* Voice Control Section (unchanged) */}
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
                  <p className="text-blue-900">&quot;{transcription}&quot;</p>
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