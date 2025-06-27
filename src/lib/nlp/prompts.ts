export const PROMPTS = {
  intentClassification: `Classify the intent of this banking command. Options:
  - transfer: User wants to make a transfer
  - set_field: User wants to set a specific field value
  - submit: User wants to submit the form
  - cancel: User wants to cancel/abort
  - help: User is asking for help
  - unknown: Can't determine intent
  
  Return ONLY the intent classification. Command: {command}`,

  fieldExtraction: `Extract banking transfer details from this command. The form has these fields:
  - recipientName (string)
  - recipientAccount (string, numbers only)
  - bankName (string)
  - amount (number)
  - currency (string: NGN, USD, EUR, GBP)
  - reference (string, optional)
  
  Return JSON with ONLY the fields mentioned. Example:
  {"amount": 5000, "currency": "NGN"}
  
  Command: {command}`,

  confirmation: `Generate a natural language confirmation for this transfer:
  - Amount: {amount} {currency}
  - Recipient: {recipientName}
  - Account: {recipientAccount}
  - Bank: {bankName}
  
  Keep it concise and friendly. Example:
  "I'll transfer 5000 NGN to John Doe at GTBank. Say 'confirm' to proceed."`
};