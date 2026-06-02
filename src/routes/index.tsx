import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Sparkles, AlertTriangle, ChevronLeft } from "lucide-react";

import { ChatSidebar } from "@/components/pil/ChatSidebar";
import { AppHeader } from "@/components/pil/AppHeader";
import { PromptInputBar } from "@/components/pil/PromptInputBar";
import { PromptIntelligencePreview } from "@/components/pil/PromptIntelligencePreview";
import { MissingContextSelector } from "@/components/pil/MissingContextSelector";
import { AssumptionCards } from "@/components/pil/AssumptionCards";
import { ClarifyingQuestionCards } from "@/components/pil/ClarifyingQuestionCards";
import { ReliabilityRiskCard } from "@/components/pil/ReliabilityRiskCard";
import { EnhancedPromptReview } from "@/components/pil/EnhancedPromptReview";
import { FinalResponseCard } from "@/components/pil/FinalResponseCard";
import { TrustFeedbackForm } from "@/components/pil/TrustFeedbackForm";
import { Button } from "@/components/ui/button";
import { DEFAULT_PROMPT, ENHANCED_PROMPT, FINAL_RESPONSE, CONTEXT_FIELDS } from "@/lib/pil-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prompt Intelligence Layer — ChatGPT" },
      {
        name: "description",
        content:
          "Analyze prompt quality, surface missing context and assumptions, and generate higher-trust AI responses with less verification.",
      },
      { property: "og:title", content: "Prompt Intelligence Layer" },
      {
        property: "og:description",
        content: "Prompt → Prompt Intelligence Layer → Better Prompt → Higher Trust Output → Less Verification.",
      },
    ],
  }),
  component: Index,
});

type Step = "entry" | "analysis" | "review" | "response";
type Loading = null | "analyzing" | "enhancing" | "generating";

function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function Index() {
  const [step, setStep] = useState<Step>("entry");
  const [loading, setLoading] = useState<Loading>(null);
  const [error, setError] = useState<string | null>(null);

  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [enhanced, setEnhanced] = useState(ENHANCED_PROMPT);

  const [selectedContext, setSelectedContext] = useState<string[]>(["industry", "geography", "timeHorizon"]);
  const [contextValues, setContextValues] = useState<Record<string, string>>(
    Object.fromEntries(CONTEXT_FIELDS.map((f) => [f.key, f.defaultValue])),
  );

  const headerTitle = step === "review" ? "Enhanced Prompt Review" : "Prompt Intelligence Layer";

  function run(phase: Exclude<Loading, null>, next: Step, label: string) {
    setError(null);
    setLoading(phase);
    setTimeout(() => {
      // Simulated chance to demo error state on empty prompt
      if (!prompt.trim()) {
        setLoading(null);
        setError("Please enter a prompt to analyze.");
        return;
      }
      setLoading(null);
      setStep(next);
    }, 1100);
    void label;
  }

  const toggleContext = (key: string) =>
    setSelectedContext((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <ChatSidebar
        onNewChat={() => {
          setStep("entry");
          setPrompt(DEFAULT_PROMPT);
          setEnhanced(ENHANCED_PROMPT);
          setError(null);
        }}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader title={headerTitle} />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          {error && (
            <div className="mx-auto mb-6 flex max-w-3xl items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="size-4" />
              {error}
            </div>
          )}

          {loading && (
            <LoadingOverlay
              label={
                loading === "analyzing"
                  ? "Analyzing prompt quality…"
                  : loading === "enhancing"
                    ? "Generating enhanced prompt…"
                    : "Generating response…"
              }
            />
          )}

          {/* STATE 1 */}
          {!loading && step === "entry" && (
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-col items-center text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-foreground text-background">
                  <Sparkles className="size-7" />
                </span>
                <h2 className="mt-5 text-3xl font-semibold">How can I help you today?</h2>
                <p className="mt-2 max-w-lg text-muted-foreground">
                  Start a conversation. The intelligence layer below will analyze your prompt quality in
                  real time.
                </p>
              </div>

              <div className="mt-8">
                <PromptInputBar
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={() => run("analyzing", "analysis", "Analyzing prompt quality…")}
                />
              </div>

              {prompt.trim() && (
                <div className="mt-6">
                  <PromptIntelligencePreview />
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <Button
                  size="lg"
                  disabled={!prompt.trim()}
                  onClick={() => run("analyzing", "analysis", "Analyzing prompt quality…")}
                >
                  Analyze Prompt
                </Button>
              </div>
            </div>
          )}

          {/* STATE 2 */}
          {!loading && step === "analysis" && (
            <div className="mx-auto max-w-3xl space-y-5">
              <PromptQualityScore />
              <MissingContextSelector
                selected={selectedContext}
                values={contextValues}
                onToggle={toggleContext}
                onChange={(k, v) => setContextValues((p) => ({ ...p, [k]: v }))}
              />
              <AssumptionCards />
              <ClarifyingQuestionCards />
              <ReliabilityRiskCard />

              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => run("enhancing", "review", "Generating enhanced prompt…")}>
                  Generate Enhanced Prompt
                </Button>
                <Button size="lg" variant="outline" onClick={() => setStep("entry")}>
                  <ChevronLeft className="size-4" /> Back
                </Button>
              </div>
            </div>
          )}

          {/* STATE 3 */}
          {!loading && step === "review" && (
            <EnhancedPromptReview
              originalPrompt={prompt}
              enhancedPrompt={enhanced}
              onEnhancedChange={setEnhanced}
              onGenerate={() => run("generating", "response", "Generating response…")}
              onEdit={() => setStep("analysis")}
            />
          )}

          {/* STATE 4 */}
          {!loading && step === "response" && (
            <div className="mx-auto max-w-3xl space-y-6">
              <FinalResponseCard enhancedPrompt={enhanced} response={FINAL_RESPONSE} />
              <TrustFeedbackForm />
              <div>
                <Button variant="outline" onClick={() => setStep("review")}>
                  <ChevronLeft className="size-4" /> Back to review
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
