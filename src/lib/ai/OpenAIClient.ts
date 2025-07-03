/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAI } from 'openai';
import { AIClient } from './AIClient';
import { fieldToLabel, generateConfirmation } from '../utils/string-helper';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export class OpenAIClient implements AIClient {
  async classifyIntent(command: string): Promise<string> {
    const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
        { role: 'system', content: 'Classify intent from: set_field, focus_field, submit_form, reset_form, help, unknown' },
        { role: 'user', content: command }
        ],
        temperature: 0.1,
        max_tokens: 20
    });
    return res.choices[0]?.message?.content?.trim() || 'unknown';
  }

  async extractFields(command: string): Promise<any> {
    const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
        {
            role: 'system',
            content: `Extract Nigerian banking transfer details. Respond with JSON. Example: {"amount":"5000","recipientName":"John Doe"}`
        },
        { role: 'user', content: command }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
    });

    const content = res.choices[0]?.message?.content;
    if (!content) throw new Error('No content in response');

    const updates = JSON.parse(content);
    
    // Validate data
    if (updates.amount && !updates.currency) {
        updates.currency = 'NGN';
    }

    if (updates.recipientAccount && !/^\d{10}$/.test(updates.recipientAccount)) {
        throw new Error('Account number must be 10 digits');
    }

    return {
        fieldUpdates: updates,
        confirmation: generateConfirmation(updates)
    };
  }

  async focusField(command: string, currentState: any): Promise<any> {
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Identify which field to focus on: recipientName, recipientAccount, bankName, amount, reference.' },
        { role: 'user', content: command }
      ],
      temperature: 0.1,
      max_tokens: 20
    });
    const field = res.choices[0]?.message?.content?.trim();
    if (!field) throw new Error('No field identified');

    return {
        confirmation: `Editing ${fieldToLabel(field)}`,
        fieldUpdates: { [field]: currentState?.[field] || '' }
    };
  }
}