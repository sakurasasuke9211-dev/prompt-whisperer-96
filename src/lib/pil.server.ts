import { callGrok, safeJsonParse } from "./grok.server";

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
  mocked: boolean;
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
  mocked: boolean;
}

export interface FinalResponseResult {
  response: string;
  mocked: boolean;
}

function statusForScore(score: number): string {
  if (score >= 85) return "Strong";
  if (score >= 65) return "Needs improvement";
  return "Weak";
}

// ---- Mock fallbacks (keep the demo working without API credentials) ----

function mockAnalyze(prompt: string): AnalyzePromptResult {
  return {
    score: 62,
    status: statusForScore(62),
    missingContext: [
      { key: "industry", label: "Industry" },
      { key: "geography", label: "Geography" },
      { key: "timeHorizon", label: "Time Horizon" },
      { key: "audience", label: "Intended Audience" },
      { key: "outputFormat", label: "Output Format" },
    ],
    assumptions: [
      "Assuming global market data",
      "Assuming current year trends",
      "Assuming a general business audience",
      "Assuming recommendations are strategic, not operational",
    ],
    clarifyingQuestions: [
      "Which industry should this focus on?",
      "Which region or market?",
      "Strategic or operational recommendations?",
      "Who is the target audience?",
    ],
    riskLevel: "Medium",
    riskReason:
      "The prompt is broad and lacks scope, so the AI may make assumptions that reduce accuracy.",
    suggestedEnhancedPrompt: `${prompt.trim()} Please specify industry, geography, time horizon, intended audience, and desired output format for a more accurate, reliable answer.`,
    mocked: true,
  };
}

function mockEnhanced(prompt: string): EnhancedPromptResult {
  const enhancedPrompt = `${prompt.trim()} Focus on a specific industry and region, target a defined audience, present findings in a clear structured format, and state any assumptions explicitly.`;
  return {
    enhancedPrompt,
    newScore: 92,
    metrics: [
      { label: "Prompt Clarity", from: "62", to: "92", positive: true },
      { label: "Context Completeness", from: "55%", to: "95%", positive: true },
      { label: "Assumptions Reduced", from: "4", to: "1", positive: true },
      { label: "Expected Verification Effort", from: "", to: "−35%", positive: true },
    ],
    mocked: true,
  };
}

function mockFinal(): FinalResponseResult {
  return {
    response:
      "Here is a structured response based on your enhanced prompt. The added context (industry, region, audience, and output format) lets the analysis stay focused and reduces the need for you to verify assumptions. Key findings and recommendations are organized into clear sections with explicit caveats where data is limited.",
    mocked: true,
  };
}

// ---- Core logic (Grok-backed with safe parsing + fallbacks) ----

export async function analyzePromptLogic(originalPrompt: string): Promise<AnalyzePromptResult> {
  const system =
    "You are a Prompt Intelligence analyzer. Evaluate the user's prompt quality and respond ONLY with strict JSON matching this shape: " +
    '{"score": number (0-100), "status": string, "missingContext": [{"key": string, "label": string}], ' +
    '"assumptions": string[], "clarifyingQuestions": string[], "riskLevel": "Low"|"Medium"|"High", ' +
    '"riskReason": string, "suggestedEnhancedPrompt": string}.';

  const { text, mocked } = await callGrok({
    system,
    prompt: `Analyze this prompt:\n"""${originalPrompt}"""`,
    json: true,
  });

  if (mocked) return mockAnalyze(originalPrompt);

  const parsed = safeJsonParse<Partial<AnalyzePromptResult>>(text);
  if (!parsed || typeof parsed.score !== "number") return mockAnalyze(originalPrompt);

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
    suggestedEnhancedPrompt: parsed.suggestedEnhancedPrompt || mockAnalyze(originalPrompt).suggestedEnhancedPrompt,
    mocked: false,
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

  const { text, mocked } = await callGrok({
    system,
    prompt: `Original prompt:\n"""${input.originalPrompt}"""\n\nContext & answers:\n${JSON.stringify(detail, null, 2)}`,
    json: true,
  });

  if (mocked) return mockEnhanced(input.originalPrompt);

  const parsed = safeJsonParse<Partial<EnhancedPromptResult>>(text);
  if (!parsed || !parsed.enhancedPrompt) return mockEnhanced(input.originalPrompt);

  const newScore = Math.max(0, Math.min(100, Math.round(parsed.newScore ?? 90)));
  return {
    enhancedPrompt: parsed.enhancedPrompt,
    newScore,
    metrics: Array.isArray(parsed.metrics) ? parsed.metrics : mockEnhanced(input.originalPrompt).metrics,
    mocked: false,
  };
}

export async function generateFinalResponseLogic(enhancedPrompt: string): Promise<FinalResponseResult> {
  const { text, mocked } = await callGrok({
    system: "You are a helpful, reliable assistant. Answer clearly and cite assumptions where relevant.",
    prompt: enhancedPrompt,
  });

  if (mocked || !text) return mockFinal();
  return { response: text, mocked: false };
}
