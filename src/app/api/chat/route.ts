/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAIClient } from '@/lib/ai/getAIClient';
import { NextResponse } from 'next/server';
import { createClient } from 'redis';

// const port = Number(process.env.REDIS_PORT);

const redis = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 18581
    }
});

// Connect to Redis with error handling
(async () => {
  try {
    await redis.connect();
    // await withRetry(() => redis.connect());
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
})();

// Type definitions
interface ApiRequest {
  command: string;
  currentState?: Record<string, any>;
  sessionId?: string;
}

interface ApiResponse {
  fieldUpdates?: Record<string, any>;
  confirmation?: string;
  intent?: string;
  requiresConfirmation?: boolean;
  error?: string;
}

// export const runtime = 'edge';

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60; // 60 seconds
const RATE_LIMIT_MAX = 10; // 10 requests per window

const ai = getAIClient();

export async function POST(request: Request) {
  try {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    
    // Rate limiting using Redis
    const rateLimitKey = `rate_limit:${ip}`;
    const current = await redis.incr(rateLimitKey);
    
    if (current === 1) {
      await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW);
    }
    
    if (current > RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Request validation
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type. Please use application/json' },
        { status: 400 }
      );
    }
    // console.log(request.json());
    
    const { command, currentState, sessionId } = await request.json() as ApiRequest;

    if (!command?.trim()) {
      return NextResponse.json(
        { confirmation: "I didn't hear anything. Please try again.", error: 'Empty command' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `cache:${sessionId || 'anon'}:${command.toLowerCase().trim()}`;
    const cachedResponse = await redis.get(cacheKey);
    
    if (cachedResponse) {
      console.log('Serving from cache');
      return NextResponse.json(JSON.parse(cachedResponse));
    }

    const intent = await ai.classifyIntent(command); 
    // const intent = await withRetry(() => ai.classifyIntent(command));

    console.log(intent);
    
    // Process intent
    let response: ApiResponse;
    switch (intent) {
      case 'set_field':
        response = await ai.extractFields(command);
        // response = await withRetry(() => ai.extractFields(command));
        break;
      case 'focus_field':
        response = await ai.focusField(command, currentState);
        // response = await withRetry(() => ai.focusField(command, currentState));
        break;
      case 'submit_form':
        response = { requiresConfirmation: true, confirmation: 'Confirm transfer? Say "confirm" to proceed.' };
        break;
      // case 'transfer':
      //   response = { confirmation: 'This will initiate the transfer.' };
      case 'reset_form':
        response = { confirmation: 'This will clear all form data. Say "confirm" to reset.' };
        break;
      case 'help':
        response = { confirmation: 'Try: "Transfer 5000 NGN to John Doe", "Account 12345678", or "Submit"' };
        break;
      default:
        response = { confirmation: "I didn't understand that. Please try again or say 'help'." };
    }

    // Cache successful responses (5 minutes)
    if (!response.error) {
      await redis.set(cacheKey, JSON.stringify(response), { 'EX': 300 });
    }

    // Log processing
    console.log(`Processed command: ${command}`, { intent, sessionId });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing command:', error);
    return handleApiError(error);
  }
}

// Retry wrapper
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

// Error handler
function handleApiError(error: any) {
  if (error?.status === 429) {
    return NextResponse.json(
      { confirmation: "I'm getting too many requests. Please wait a moment and try again.", error: 'rate_limit' },
      { status: 429 }
    );
  }
  
  if (error?.code === 'ENOTFOUND') {
    return NextResponse.json(
      { confirmation: "I'm having trouble connecting to the service. Please check your internet connection.", error: 'network_error' },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { confirmation: "I'm having technical difficulties. Please try again later.", error: 'processing_error' },
    { status: 500 }
  );
}