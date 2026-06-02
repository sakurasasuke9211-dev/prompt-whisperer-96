export const DEFAULT_PROMPT = "Analyze the AI market and provide recommendations.";

export const ENHANCED_PROMPT =
  "Analyze the AI software market in India for 2026. Focus on enterprise adoption trends, competitive landscape, growth opportunities, and strategic recommendations for a B2B SaaS company. Present findings in executive-summary format.";

export const FINAL_RESPONSE =
  "Here is a structured analysis of the AI software market in India for 2026. Enterprise adoption is expected to be driven by productivity tools, customer support automation, developer tooling, analytics automation, and vertical AI workflows. For a B2B SaaS company, the strongest opportunities are workflow-specific AI copilots, AI-enabled analytics, and trust-focused enterprise features. Recommended next steps include focusing on a specific high-value industry segment, building transparent reliability cues, and packaging the product around measurable time savings.";

export interface ContextField {
  key: string;
  label: string;
  placeholder: string;
  defaultValue: string;
}

export const CONTEXT_FIELDS: ContextField[] = [
  { key: "industry", label: "Industry", placeholder: "e.g. AI software", defaultValue: "AI software" },
  { key: "geography", label: "Geography", placeholder: "e.g. India", defaultValue: "India" },
  { key: "timeHorizon", label: "Time Horizon", placeholder: "e.g. 2026", defaultValue: "2026" },
  {
    key: "audience",
    label: "Intended Audience",
    placeholder: "e.g. B2B SaaS leadership",
    defaultValue: "B2B SaaS leadership",
  },
  {
    key: "outputFormat",
    label: "Output Format",
    placeholder: "e.g. Executive summary",
    defaultValue: "Executive summary",
  },
  {
    key: "levelOfDetail",
    label: "Level of Detail",
    placeholder: "e.g. Strategic overview",
    defaultValue: "Strategic overview",
  },
  {
    key: "dataSource",
    label: "Data Source Preference",
    placeholder: "e.g. Market reports and recent publications",
    defaultValue: "Market reports and recent publications",
  },
];

export interface Assumption {
  id: string;
  text: string;
}

export const ASSUMPTIONS: Assumption[] = [
  { id: "global", text: "Assuming global market data" },
  { id: "current", text: "Assuming current year trends" },
  { id: "business", text: "Assuming a general business audience" },
  { id: "strategic", text: "Assuming recommendations are strategic, not operational" },
  { id: "source", text: "Assuming no specific source preference" },
];

export interface ClarifyingQuestion {
  id: string;
  text: string;
}

export const CLARIFYING_QUESTIONS: ClarifyingQuestion[] = [
  { id: "industry", text: "Which industry?" },
  { id: "region", text: "Which region?" },
  { id: "scope", text: "Strategic or operational?" },
  { id: "audience", text: "Target audience?" },
  { id: "format", text: "Preferred output format?" },
];

export const REVIEW_QUESTIONS: ClarifyingQuestion[] = [
  { id: "industry", text: "Which industry?" },
  { id: "region", text: "Which region?" },
  { id: "scope", text: "Strategic or operational?" },
  { id: "audience", text: "Target audience?" },
];

export const PREVIEW_CONTEXT = ["Industry", "Geography", "Time Horizon", "Intended Audience", "Output Format"];

export const PREVIEW_ASSUMPTIONS = [
  "Assuming global market data",
  "Assuming current year trends",
  "Assuming business audience",
];

export interface Metric {
  label: string;
  from: string;
  to: string;
  positive: boolean;
}

export const IMPROVEMENT_METRICS: Metric[] = [
  { label: "Prompt Clarity", from: "78", to: "96", positive: true },
  { label: "Context Completeness", from: "55%", to: "95%", positive: true },
  { label: "Assumptions Reduced", from: "5", to: "2", positive: true },
  { label: "Expected Verification Effort", from: "", to: "−35%", positive: true },
];

export const CHAT_HISTORY = {
  Today: ["Prompt optimization strategies", "React component architecture", "Database schema design review"],
  Yesterday: ["LLM token efficiency tips", "API rate limiting patterns", "UI/UX for AI products"],
  "Previous 30 Days": ["System prompt engineering", "Vector search basics", "Fine-tuning vs RAG"],
};
