// src/lib/gemini.ts
import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

let geminiModel: GenerativeModel | null = null;

try {
  if (apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Prefer quality; can be changed to 'gemini-1.5-flash' for speed/cost
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  } else {
    // Leave as null – route will handle and return a helpful error
    geminiModel = null;
  }
} catch (e) {
  // In case SDK initialization fails; keep null and let route handle
  geminiModel = null;
}

export { geminiModel };