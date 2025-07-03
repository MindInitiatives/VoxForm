export const PROMPTS = {
  intentClassification: `You are an intent classification system for a banking application. 
  Analyze the user's command and classify it into EXACTLY ONE of these intents:

  1. set_field - User specifies a value for a field (e.g., "set amount to 5000")
  2. focus_field - User wants to focus on specific fields (e.g., "go to recipient name field")
  3. submit_form - User wants to submit the form (e.g., "submit the transfer")
  4. reset_form - User wants to clear the form (e.g., "clear all fields")
  5. cancel - User wants to abort (e.g., "cancel this transaction")
  6. help - User requests assistance (e.g., "how do I fill this?")
  7. unknown - Unable to determine intent

  RULES:
  - Return ONLY the intent name as a lowercase string
  - Do NOT include any additional text, explanations, or formatting
  - Choose the most specific matching intent
  - Default to 'unknown' if uncertain

  Examples:
  Command: "make the amount 5000 naira" → set_field
  Command: "I need help" → help
  Command: "let's submit this" → submit_form

  Command to classify: {command}`,

  fieldExtraction: `You are a banking transfer information extraction system. 
  Extract ONLY the following fields from the user's command:
  - recipientName
  - recipientAccount 
  - bankName
  - amount
  - currency
  - reference

  Return a PROPER JSON OBJECT (not Markdown) with ONLY the fields that are present in the command.
  Do NOT include any additional text, explanations, or markdown formatting.
  Do NOT include fields that aren't mentioned in the command.
  Format numbers without commas (e.g., "5000" not "5,000").

  Example output format:
  {
    "amount": "5000",
    "recipientName": "John Doe",
    "recipientAccount": "1234567890",
    "bankName": "Access Bank",
    "currency": "NGN"
  }

  Command to process: {command}`,

  confirmation: `Generate a natural language confirmation for this transfer:
  - Amount: {amount} {currency}
  - Recipient: {recipientName}
  - Account: {recipientAccount}
  - Bank: {bankName}
  
  Keep it concise and friendly. Example:
  "I'll transfer 5000 NGN to John Doe at GTBank. Say 'confirm' to proceed."`
};