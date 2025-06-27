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
    confirmation: "I'll transfer {amount} {currency} to {recipient}. Say 'confirm' to proceed.",
    missingInfo: "I need more information to complete the transfer.",
    error: "Sorry, I didn't understand that. Try saying 'help' for examples."
  },
  settings: {
    silenceTimeout: 2000, // ms
    maxRecordingTime: 30000, // ms
    language: "en-NG",
    pitch: 1,
    rate: 1
  }
} as const;