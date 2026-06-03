import { callGroq, safeJsonParse } from "./grok.server";

// Shared types for the Prompt Intelligence Layer backend.

export interface MissingContextItem {
  key: string;
  label: string;
}

export interface AnalyzePromptResult {
  score: number;
  status: string;
  missingContext: MissingContextItem[];
  assumptions: string[];
  clarifyingQuestions: string[];
  riskLevel: "Low" | "Medium" | "High";
  riskReason: string;
  suggestedEnhancedPrompt: string;
}

export interface ImprovementMetric {
  label: string;
  from: string;
  to: string;
  positive: boolean;
}

export interface EnhancedPromptResult {
  enhancedPrompt: string;
  newScore: number;
  metrics: ImprovementMetric[];
}

export interface FinalResponseResult {
  response: string;
}

function statusForScore(score: number): string {
  if (score >= 85) return "Strong";
  if (score >= 65) return "Needs improvement";
  return "Weak";
}

// ---- Core logic (Groq-backed) ----

export async function analyzePromptLogic(originalPrompt: string): Promise<AnalyzePromptResult> {
  const system =
    "You are a Prompt Intelligence analyzer. Evaluate the user's prompt quality and respond ONLY with strict JSON matching this shape: " +
    '{"score": number (0-100), "status": string, "missingContext": [{"key": string, "label": string}], ' +
    '"assumptions": string[], "clarifyingQuestions": string[], "riskLevel": "Low"|"Medium"|"High", ' +
    '"riskReason": string, "suggestedEnhancedPrompt": string}.';

  const { text } = await callGroq({
    system,
    prompt: `Analyze this prompt:\n"""${originalPrompt}"""`,
    json: true,
  });

  const parsed = safeJsonParse<Partial<AnalyzePromptResult>>(text);
  if (!parsed || typeof parsed.score !== "number") {
    throw new Error("Failed to parse analysis response from the AI.");
  }

  const score = Math.max(0, Math.min(100, Math.round(parsed.score)));
  return {
    score,
    status: parsed.status || statusForScore(score),
    missingContext: Array.isArray(parsed.missingContext) ? parsed.missingContext : [],
    assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
    clarifyingQuestions: Array.isArray(parsed.clarifyingQuestions)
      ? parsed.clarifyingQuestions
      : [],
    riskLevel: parsed.riskLevel === "Low" || parsed.riskLevel === "High" ? parsed.riskLevel : "Medium",
    riskReason: parsed.riskReason || "Prompt may lack sufficient context.",
    suggestedEnhancedPrompt:
      parsed.suggestedEnhancedPrompt ||
      `${originalPrompt.trim()} Please specify industry, geography, time horizon, intended audience, and desired output format.`,
  };
}

export interface GenerateEnhancedInput {
  originalPrompt: string;
  selectedMissingContext?: string[];
  contextAnswers?: Record<string, string>;
  acceptedAssumptions?: string[];
  changedAssumptions?: Record<string, string>;
  clarifyingAnswers?: Record<string, string>;
}

export async function generateEnhancedPromptLogic(
  input: GenerateEnhancedInput,
): Promise<EnhancedPromptResult> {
  const detail = {
    selectedMissingContext: input.selectedMissingContext ?? [],
    contextAnswers: input.contextAnswers ?? {},
    acceptedAssumptions: input.acceptedAssumptions ?? [],
    changedAssumptions: input.changedAssumptions ?? {},
    clarifyingAnswers: input.clarifyingAnswers ?? {},
  };

  const system =
    "You are a Prompt Intelligence rewriter. Rewrite the user's prompt into a clearer, more complete prompt using the provided context, assumptions, and answers. " +
    'Respond ONLY with strict JSON: {"enhancedPrompt": string, "newScore": number (0-100), ' +
    '"metrics": [{"label": string, "from": string, "to": string, "positive": boolean}]}.';

  const { text } = await callGroq({
    system,
    prompt: `Original prompt:\n"""${input.originalPrompt}"""\n\nContext & answers:\n${JSON.stringify(detail, null, 2)}`,
    json: true,
  });

  const parsed = safeJsonParse<Partial<EnhancedPromptResult>>(text);
  if (!parsed || !parsed.enhancedPrompt) {
    throw new Error("Failed to parse enhanced prompt response from the AI.");
  }

  const newScore = Math.max(0, Math.min(100, Math.round(parsed.newScore ?? 90)));
  return {
    enhancedPrompt: parsed.enhancedPrompt,
    newScore,
    metrics: Array.isArray(parsed.metrics) ? parsed.metrics : [],
  };
}

export async function generateFinalResponseLogic(enhancedPrompt: string): Promise<FinalResponseResult> {
  const { text } = await callGroq({
    system: "You are a helpful, reliable assistant. Answer clearly and cite assumptions where relevant.",
    prompt: enhancedPrompt,
  });

  return { response: text };
}
