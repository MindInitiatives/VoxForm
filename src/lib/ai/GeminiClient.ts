import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIClient } from './AIClient';
import { extractAndParseJSON, fieldToLabel, generateConfirmation } from '../utils/string-helper';
import { PROMPTS } from '../nlp/prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Gemini uses model like "gemini-pro"
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export class GeminiClient implements AIClient {
  async classifyIntent(command: string): Promise<string> {
    const prompt = PROMPTS.intentClassification
                .replace('{command}', command);
    console.log(prompt);
    
    // `
    //     Classify this command into one of the following intents:
    //     - set_field
    //     - focus_field
    //     - submit_form
    //     - reset_form
    //     - help
    //     - unknown

    //     Command: "${command}"
    //     Only respond with the intent keyword.
    // `;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    return response.toLowerCase();
  }

  async extractFields(command: string): Promise<{ fieldUpdates: Record<string, string>, confirmation: string }> {
    const prompt = PROMPTS.fieldExtraction
                .replace('{command}', command);
    console.log(prompt);
    
    // `
    //     Extract Nigerian banking transfer details from the command and respond in valid JSON format with any of these fields: amount, recipientName, recipientAccount, bankName, currency, reference.
    //     Command: "${command}"
    //     Example response:
    //     {
    //     "amount": "5000",
    //     "recipientName": "John Doe",
    //     "recipientAccount": "1234567890",
    //     "bankName": "Access Bank",
    //     "currency": "NGN"
    //     }
    //     Only return the JSON object.
    // `;

    const result = await model.generateContent(prompt);
    const jsonString = result.response.text().trim().replace(/,\s*}/g, '}'); // Remove trailing comma before closing brace;

    console.log(jsonString);

    try {
        const updates = extractAndParseJSON(jsonString);

        console.log(updates);
        

        return {
            fieldUpdates: updates,
            confirmation: generateConfirmation(updates)
        };

    } catch (e) {
      console.error('Gemini JSON parsing failed:', jsonString);
      if (typeof e === 'object' && e !== null && 'position' in e) {
        const pos = (e as { position: number }).position;
        console.error('Parse error at position', pos);
        console.error('Near:', jsonString.slice(pos - 20, pos + 20));
      } else {
        console.error('Parse error:', e);
      }
      throw new Error('Failed to parse Gemini response');
    }
  }

  async focusField(command: string, currentState: Record<string, string>): Promise<{ confirmation: string; fieldUpdates: Record<string, string> }> {
    const prompt = `
        From the following command, identify the field being referred to:
        Options: recipientName, recipientAccount, bankName, amount, reference

        Command: "${command}"

        Only return the field name.
    `;

    const result = await model.generateContent(prompt);
    
    const field = result.response.text().trim();
    if (!field) throw new Error('No field identified');

    return {
        confirmation: `Editing ${fieldToLabel(field)}`,
        fieldUpdates: { [field]: currentState?.[field] || '' }
    };
  }
}
