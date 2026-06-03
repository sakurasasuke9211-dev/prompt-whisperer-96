import process from "node:process";

// Server-only Grok (xAI) helper. Never import this file from client code.
// Reads env at call time so it works in the Worker request context.

export interface CallGrokOptions {
  system?: string;
  prompt: string;
  /** When true, instruct the model to respond with JSON and parse it. */
  json?: boolean;
  temperature?: number;
}

export interface GrokResult {
  /** Raw text content returned by the model. */
  text: string;
  /** True when the call fell back to a mock (no key / API error). */
  mocked: boolean;
}

function getConfig() {
  return {
    apiKey: process.env.XAI_API_KEY,
    baseUrl: process.env.XAI_BASE_URL || "https://api.x.ai/v1",
    model: process.env.GROK_MODEL || "grok-3",
  };
}

/**
 * Calls the Grok chat completions API. If no API key is configured or the
 * request fails, returns { mocked: true } with empty text so callers can fall
 * back to deterministic mock data and keep the demo working.
 */
export async function callGrok(options: CallGrokOptions): Promise<GrokResult> {
  const { apiKey, baseUrl, model } = getConfig();

  if (!apiKey) {
    return { text: "", mocked: true };
  }

  try {
    const messages: Array<{ role: string; content: string }> = [];
    if (options.system) messages.push({ role: "system", content: options.system });
    messages.push({ role: "user", content: options.prompt });

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.4,
        ...(options.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!res.ok) {
      console.error(`Grok API error: ${res.status} ${res.statusText}`);
      return { text: "", mocked: true };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) return { text: "", mocked: true };
    return { text, mocked: false };
  } catch (error) {
    console.error("Grok request failed:", error);
    return { text: "", mocked: true };
  }
}

/** Safely parse JSON from a model response (handles ```json fences and noise). */
export function safeJsonParse<T>(raw: string): T | null {
  if (!raw) return null;
  let candidate = raw.trim();

  // Strip markdown code fences if present.
  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) candidate = fenced[1].trim();

  // Fall back to the first {...} or [...] block.
  if (!candidate.startsWith("{") && !candidate.startsWith("[")) {
    const objMatch = candidate.match(/[{[][\s\S]*[}\]]/);
    if (objMatch) candidate = objMatch[0];
  }

  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}
