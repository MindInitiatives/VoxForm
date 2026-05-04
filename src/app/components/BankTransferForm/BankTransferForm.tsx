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

const transferFormSchema = z.object({
  recipientName: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Invalid characters in name"),
  recipientAccount: z.string()
    .min(8, "Account must be at least 8 digits")
    .max(20, "Account must be less than 20 digits")
    .regex(/^\d+$/, "Account must contain only numbers"),
  bankName: z.string().min(3, "Bank name must be at least 3 characters"),
  amount: z.string(),
  currency: z.enum(["NGN", "USD", "EUR", "GBP", "JPY"]),
  reference: z.string().optional(),
  transferDate: z.string()
    .refine(val => new Date(val) >= new Date(new Date().setHours(0,0,0,0)), "Date cannot be in the past"),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) })
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

const sectionLabel = "text-xs font-semibold text-muted-foreground uppercase tracking-widest";
const fieldLabel   = "text-xs font-medium text-muted-foreground uppercase tracking-wider";

const BankTransferForm = () => {
  const { resetForm, isSubmitting, submissionStatus } = useFormState({
    recipientName: '', recipientAccount: '', bankName: '',
    amount: '', currency: 'NGN', reference: '',
    transferDate: new Date().toISOString().split('T')[0],
    termsAccepted: false,
  });

  const {
    transcription, transcriptionError, speak,
    commandHistory, activeField, setActiveField,
    activeFieldValue, confirmationState,
  } = useVoice();

  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      recipientName: '', recipientAccount: '', bankName: '',
      amount: '', currency: 'NGN', reference: '',
      transferDate: format(new Date(), 'yyyy-MM-dd'),
      termsAccepted: true,
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await form.trigger();
    if (!isValid) { speak("Please fix the errors in the form before submitting."); return; }
    const values = form.getValues();
    if (Number(values.amount) > 10000) {
      speak("Large transfers require additional verification. Please contact support.");
      return;
    }
    try {
      confirmationState.onConfirm(async () => {
        const response = await apiClient.post('/transfer', values);
        console.log(response);
      });
    } catch (error) { console.error("Transfer failed:", error); }
  };

  useEffect(() => {
    if (!activeField || !formRef.current) return;
    const field = formRef.current.querySelector(`[name="${activeField}"]`);
    if (field) (field as HTMLElement).focus();
    if (activeFieldValue && typeof activeFieldValue === 'object' && !Array.isArray(activeFieldValue)) {
      Object.entries(activeFieldValue).forEach(([key, value]) => {
        form.setValue(key as keyof TransferFormValues, value as TransferFormValues[keyof TransferFormValues]);
      });
    } else if (activeFieldValue !== undefined && activeFieldValue !== null) {
      if (activeField === 'termsAccepted') {
        if (activeFieldValue === true) form.setValue('termsAccepted', true);
      } else {
        form.setValue(activeField as keyof TransferFormValues, activeFieldValue as TransferFormValues[keyof TransferFormValues]);
      }
    }
  }, [activeField, activeFieldValue]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">

      {/* ── Form ── */}
      <div className="lg:col-span-2 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-4 rounded-full bg-indigo-500" />
          <span className={sectionLabel}>Transfer details</span>
        </div>

        <Form {...form}>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" aria-label="Bank transfer form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <FormField control={form.control} name="recipientName" render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabel}>Recipient Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} onFocus={() => setActiveField('recipientName')}
                      className={cn(form.formState.errors.recipientName && "border-destructive")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="recipientAccount" render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabel}>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" {...field} onFocus={() => setActiveField('recipientAccount')}
                      className={cn(form.formState.errors.recipientAccount && "border-destructive")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="bankName" render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabel}>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="GTBank, Access Bank…" {...field} onFocus={() => setActiveField('bankName')}
                      className={cn(form.formState.errors.bankName && "border-destructive")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex gap-3">
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className={fieldLabel}>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" min="0.01" step="0.01" {...field}
                        onFocus={() => setActiveField('amount')}
                        className={cn(form.formState.errors.amount && "border-destructive")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currency" render={({ field }) => (
                  <FormItem className="w-28">
                    <FormLabel className={fieldLabel}>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}
                      onOpenChange={(open) => open && setActiveField('currency')}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["NGN","USD","EUR","GBP","JPY"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="reference" render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabel}>
                    Reference <span className="normal-case text-muted-foreground/50">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Rent payment" {...field} onFocus={() => setActiveField('reference')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="transferDate" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className={fieldLabel}>Transfer Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" onClick={() => setActiveField('transferDate')}
                          className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground",
                            form.formState.errors.transferDate && "border-destructive")}>
                          {field.value && !isNaN(new Date(field.value).getTime())
                            ? format(new Date(field.value), "PPP")
                            : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value && !isNaN(new Date(field.value).getTime()) ? new Date(field.value) : undefined}
                        onSelect={(date) => { field.onChange(format(date || new Date(), "yyyy-MM-dd")); setActiveField('transferDate'); }}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Terms */}
            <FormField control={form.control} name="termsAccepted" render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange}
                    onFocus={() => setActiveField('termsAccepted')}
                    className={cn(form.formState.errors.termsAccepted && "border-destructive")} />
                </FormControl>
                <div>
                  <FormLabel className="text-sm text-muted-foreground font-normal cursor-pointer leading-relaxed">
                    I agree to the terms and conditions and confirm this transfer is legitimate
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )} />

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing…
                  </span>
                ) : 'Submit Transfer'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { form.reset(); resetForm(); }}>
                Reset Form
              </Button>
            </div>
          </form>
        </Form>

        {submissionStatus && (
          <div className="mt-6">
            <TransferConfirmation status={submissionStatus} onClose={() => {}} />
          </div>
        )}
      </div>

      {/* ── Voice panel ── */}
      <div className="p-6 sm:p-8 bg-muted/20">
        <div className="sticky top-20 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-indigo-500/50" />
            <span className={sectionLabel}>Voice Controls</span>
          </div>

          <MicrophoneButton />

          {transcriptionError && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <p>{transcriptionError}</p>
              <button onClick={() => {}} className="mt-1.5 text-xs font-medium hover:opacity-70 transition">Retry</button>
            </div>
          )}

          {transcription && (
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/5 px-4 py-3">
              <p className="text-xs text-indigo-600 dark:text-indigo-300/70 mb-1 uppercase tracking-wider">You said</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-200 font-medium">&quot;{transcription}&quot;</p>
            </div>
          )}

          {activeField && (
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Filling <span className="text-foreground font-medium">{activeField.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
              </p>
            </div>
          )}

          <HistoryPanel commands={commandHistory} />
          <VoiceCommandHelp />
        </div>
      </div>
    </div>
  );
};

export default BankTransferForm;
