import { AIClient } from './AIClient';
import { OpenAIClient } from './OpenAIClient';
import { GeminiClient } from './GeminiClient';

let cachedClient: AIClient;

export function getAIClient(): AIClient {
  if (cachedClient) return cachedClient;

  const provider = process.env.AI_PROVIDER?.toLowerCase();

  if (provider === 'gemini') {
    cachedClient = new GeminiClient();
  } else {
    cachedClient = new OpenAIClient(); // default
  }

  return cachedClient;
}
