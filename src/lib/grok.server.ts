import process from "node:process";

// Server-only Groq helper. Never import this file from client code.
// Reads env at call time so it works in the Worker request context.

export interface CallGroqOptions {
  system?: string;
  prompt: string;
  /** When true, instruct the model to respond with JSON and parse it. */
  json?: boolean;
  temperature?: number;
}

export interface GroqResult {
  /** Raw text content returned by the model. */
  text: string;
}

function getConfig() {
  const apiKey = process.env.GROQ_API_KEY;
  const baseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  return { apiKey, baseUrl, model };
}

/**
 * Calls the Groq chat completions API. Throws on any failure so callers can
 * surface a clear error to the user — no mock fallback.
 */
export async function callGroq(options: CallGroqOptions): Promise<GroqResult> {
  const { apiKey, baseUrl, model } = getConfig();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

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
    const detail = await res.text().catch(() => "");
    console.error(`Groq API error: ${res.status} ${res.statusText} ${detail}`);
    throw new Error(`Groq API error (${res.status}): ${res.statusText}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text) {
    throw new Error("Groq API returned an empty response.");
  }
  return { text };
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
