import { FormState, ProcessResult } from "@/types";

export const processVoiceCommand = async (
  command: string,
  currentState?: Partial<FormState>,
  sessionId?: string
): Promise<ProcessResult> => {
  console.log(command, 'the command here');
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command, currentState, sessionId }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return {
          error: 'rate_limit',
          confirmation: "You're sending requests too quickly. Please wait a moment."
        };
      }
      // throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing command in processor:', error);
    return {
      confirmation: "I'm having trouble connecting to the service. Please try again.",
      error: error instanceof Error ? error.message : 'network_error'
    };
  }
};