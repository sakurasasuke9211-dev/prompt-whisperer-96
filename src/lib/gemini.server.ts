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