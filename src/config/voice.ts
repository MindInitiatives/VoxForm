export const VOICE_CONFIG = {
  commands: {
    transfer: ["transfer", "send", "pay"],
    amount: ["amount", "value", "sum"],
    recipient: ["to", "recipient", "send to"],
    account: ["account", "number", "account number"],
    bank: ["bank", "at bank", "financial institution"],
    submit: ["submit", "confirm", "proceed"],
    cancel: ["cancel", "abort", "stop"],
    help: ["help", "what can I say", "commands"]
  },
  responses: {
    confirmation: "Did you say {amount} {currency} to {recipient}? Say 'confirm' to proceed or 'cancel' to stop.",
    confirmed: "Transfer confirmed. Processing your transfer of {amount} {currency} to {recipient}.",
    cancelled: "Transfer cancelled. No action has been taken.",
    retryPrompt: "I didn't catch that. Please say 'confirm' to proceed or 'cancel' to stop the transfer.",
    missingInfo: "I need more information to complete the transfer. Please provide {missingFields}.",
    error: "Sorry, I didn't understand that. Try saying 'help' for examples."
  },
  settings: {
    silenceTimeout: 2000, // ms
    maxRecordingTime: 30000, // ms
    language: "en-NG",
    pitch: 1,
    rate: 1,
    maxConfirmationAttempts: 3 // Add this
  }
} as const;