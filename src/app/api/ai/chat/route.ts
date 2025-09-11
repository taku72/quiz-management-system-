// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';

const RETRY_TRIES = Number(process.env.GEMINI_RETRY_TRIES ?? '2');
const RETRY_BASE_MS = Number(process.env.GEMINI_RETRY_BASE_MS ?? '500');

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

async function withRetry<T>(fn: () => Promise<T>) {
  const tries = Math.max(1, RETRY_TRIES);
  let lastErr: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      // If 429, backoff and retry
      const status = err?.status || err?.response?.status;
      if (status === 429 && i < tries - 1) {
        const delay = Math.max(0, RETRY_BASE_MS) * Math.pow(2, i); // exp backoff
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, roomContext } = await req.json();

    if (!geminiModel) {
      return NextResponse.json({ error: 'GEMINI_API_KEY missing. Add it to .env.local and restart the server.' }, { status: 500 });
    }

    const system = `You are an assistant for a quiz study chat. Be concise and helpful.
If asked about quiz content, focus on explanations and learning strategies.`;

    const content = [
      { role: 'user', parts: [{ text: `${system}\n\nContext:\n${roomContext || 'N/A'}\n\nQuestion:\n${prompt}` }] }
    ];

    const result = await withRetry(() => geminiModel!.generateContent({ contents: content as any }));
    const text = (result as any)?.response?.text?.() || 'Sorry, I could not generate a response.';
    return NextResponse.json({ text });
  } catch (e: any) {
    console.error('Gemini chat error:', e);
    const status = e?.status || e?.response?.status;
    if (status === 429) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment and try again.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}