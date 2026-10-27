import process from "node:process";
import { APICallError, streamText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-provider.server";

export interface CallGeminiOptions {
  system?: string;
  prompt: string;
  json?: boolean;
  temperature?: number;
}

export async function callGemini(options: CallGeminiOptions): Promise<{ text: string }> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("The Gemini connection is not configured.");
  const provider = createLovableAiGatewayProvider(key, undefined, {
    baseURL: "https://ai.gateway.lovable.dev/v1",
  });
  try {
    const result = streamText({
      model: provider("google/gemini-3.8-flash"),
      system: options.system,
      prompt: options.prompt,
      temperature: options.temperature ?? 0.4,
      maxRetries: 0,
      providerOptions: { lovable: options.json ? { response_format: { type: "json_object" } } : {} },
    });
    const text = await result.text;
    if (!text.trim()) throw new Error("Gemini returned no answer. Please start a new request.");
    return { text };
  } catch (error) {
    if (APICallError.isInstance(error)) {
      const messages: Record<number, string> = {
        400: "Gemini could not accept this request. Please review your prompt.",
        401: "The Gemini connection needs to be configured again.",
        402: "Lovable AI credits are unavailable. Check Settings → Plans & credits.",
        403: "Gemini access is blocked. Check your workspace AI access settings before trying again.",
        404: "The selected Gemini model is currently unavailable.",
        429: "Gemini is receiving too many requests. Please wait before trying again.",
      };
      throw new Error(messages[error.statusCode ?? 500] ?? "Gemini is temporarily unavailable. Please try again later.");
    }
    throw error;
  }
}

export function safeJsonParse<T>(raw: string): T | null {
  let candidate = raw.trim();
  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) candidate = fenced[1].trim();
  if (!candidate.startsWith("{") && !candidate.startsWith("[")) {
    const match = candidate.match(/[{[][\s\S]*[}\]]/);
    if (match) candidate = match[0];
  }
  try { return JSON.parse(candidate) as T; } catch { return null; }
}
export const ANSWER_SYSTEM_PROMPT =
  "You are a helpful, knowledgeable AI assistant like ChatGPT or Google Gemini. Give complete, well-structured, natural answers in Markdown: " +
  "start with a direct answer or short intro, then use headings (##), bullet or numbered lists, **bold** key terms, tables when comparing things, and code blocks for code. " +
  "Be thorough but readable, friendly in tone, and end with a brief summary or helpful next step when appropriate. Mention key assumptions only when they matter.";

// Streams the final answer text chunk-by-chunk. Waits for the first chunk so
// upstream errors surface as a normal error before the response starts.
export async function streamGeminiAnswer(prompt: string): Promise<ReadableStream<Uint8Array>> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("The Gemini connection is not configured.");
  const provider = createLovableAiGatewayProvider(key, undefined, {
    baseURL: "https://ai.gateway.lovable.dev/v1",
  });
  let streamError: unknown = null;
  const result = streamText({
    model: provider("google/gemini-3.8-flash"),
    system: ANSWER_SYSTEM_PROMPT,
    prompt,
    temperature: 0.7,
    maxRetries: 0,
    onError: ({ error }) => { streamError = error; },
  });
  const iterator = result.textStream[Symbol.asyncIterator]();
  const first = await iterator.next();
  if (first.done && streamError) {
    const e = streamError;
    if (APICallError.isInstance(e) && e.statusCode === 429) throw new Error("Gemini is receiving too many requests. Please wait before trying again.");
    if (APICallError.isInstance(e) && e.statusCode === 402) throw new Error("Lovable AI credits are unavailable. Check Settings → Plans & credits.");
    throw new Error("Gemini is temporarily unavailable. Please try again later.");
  }
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      if (!first.done && first.value) controller.enqueue(encoder.encode(first.value));
      if (first.done) controller.close();
    },
    async pull(controller) {
      const next = await iterator.next();
      if (next.done) controller.close();
      else controller.enqueue(encoder.encode(next.value));
    },
  });
}
