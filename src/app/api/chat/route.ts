import { getAIClient } from '@/lib/ai/getAIClient';
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiRequest {
  command: string;
  currentState?: Record<string, unknown>;
  sessionId?: string;
}

interface ApiResponse {
  fieldUpdates?: Record<string, unknown>;
  confirmation?: string;
  intent?: string;
  requiresConfirmation?: boolean;
  error?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX    = 10; // requests per window
const CACHE_TTL         = 300; // 5 minutes

// ─── AI client ────────────────────────────────────────────────────────────────

const ai = getAIClient();

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {

    // ── Rate limiting ────────────────────────────────────────────────────────
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rateLimitKey = `rate_limit:${ip}`;

    // Atomic pipeline: set the key with NX+EX (only on first request),
    // then increment (eliminates the INCR/EXPIRE race condition).
    const [[, current]] = await redis.pipeline()
      .set(rateLimitKey, 0, { nx: true, ex: RATE_LIMIT_WINDOW })
      .incr(rateLimitKey)
      .exec() as [unknown, number][];

    if ((current as number) > RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // ── Content-type guard ───────────────────────────────────────────────────
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type. Please use application/json' },
        { status: 400 }
      );
    }

    const { command, currentState, sessionId } = await request.json() as ApiRequest;

    if (!command?.trim()) {
      return NextResponse.json(
        { confirmation: "I didn't hear anything. Please try again.", error: 'Empty command' },
        { status: 400 }
      );
    }

    // ── Cache lookup ─────────────────────────────────────────────────────────
    const cacheKey = `cache:${sessionId || 'anon'}:${command.toLowerCase().trim()}`;

    try {
      const cached = await redis.get<ApiResponse>(cacheKey);
      if (cached) {
        console.log('[Cache] hit:', cacheKey);
        return NextResponse.json(cached);
      }
    } catch (cacheErr) {
      // Cache miss or error, continue to AI, never block the request
      console.warn('[Cache] read failed, skipping:', cacheErr);
    }

    // ── Intent classification ────────────────────────────────────────────────
    const intent = await ai.classifyIntent(command);
    console.log('[Intent]', intent);

    // ── Intent routing ───────────────────────────────────────────────────────
    let response: ApiResponse;
    switch (intent) {
      case 'set_field':
        response = await ai.extractFields(command);
        break;
      case 'focus_field':
        response = await ai.focusField(command, currentState ?? {}) as ApiResponse;
        break;
      case 'submit_form':
        response = {
          requiresConfirmation: true,
          confirmation: 'Confirm transfer? Say "confirm" to proceed.',
        };
        break;
      case 'reset_form':
        response = {
          confirmation: 'This will clear all form data. Say "confirm" to reset.',
        };
        break;
      case 'help':
        response = {
          confirmation: 'Try: "Transfer 5000 NGN to John Doe", "Account 12345678", or "Submit"',
        };
        break;
      default:
        response = {
          confirmation: "I didn't understand that. Please try again or say 'help'.",
        };
    }

    // ── Cache write ──────────────────────────────────────────────────────────
    if (!response.error) {
      try {
        // Upstash get() auto-parses JSON, so store the object directly
        await redis.set(cacheKey, response, { ex: CACHE_TTL });
      } catch (cacheErr) {
        console.warn('[Cache] write failed:', cacheErr);
      }
    }

    console.log(`[Command] processed: "${command}"`, { intent, sessionId });
    return NextResponse.json(response);

  } catch (error) {
    console.error('[Route] unhandled error:', error);
    return handleApiError(error);
  }
}

// ─── Error handler ────────────────────────────────────────────────────────────

function handleApiError(error: unknown) {
  const err = error as Record<string, unknown>;

  if (err?.status === 429) {
    return NextResponse.json(
      {
        confirmation: "I'm getting too many requests. Please wait a moment and try again.",
        error: 'rate_limit',
      },
      { status: 429 }
    );
  }

  if (err?.code === 'ENOTFOUND') {
    return NextResponse.json(
      {
        confirmation: "I'm having trouble connecting. Please check your connection.",
        error: 'network_error',
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      confirmation: "I'm having technical difficulties. Please try again later.",
      error: 'processing_error',
    },
    { status: 500 }
  );
}