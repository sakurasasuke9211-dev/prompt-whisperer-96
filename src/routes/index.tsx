import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, AlertTriangle, ChevronLeft } from "lucide-react";

import { ChatSidebar } from "@/components/pil/ChatSidebar";
import { AppHeader } from "@/components/pil/AppHeader";
import { PromptInputBar } from "@/components/pil/PromptInputBar";

import { MissingContextSelector } from "@/components/pil/MissingContextSelector";
import { AssumptionCards } from "@/components/pil/AssumptionCards";
import { ClarifyingQuestionCards } from "@/components/pil/ClarifyingQuestionCards";
import { ReliabilityRiskCard } from "@/components/pil/ReliabilityRiskCard";
import { EnhancedPromptReview } from "@/components/pil/EnhancedPromptReview";
import { FinalResponseCard } from "@/components/pil/FinalResponseCard";
import { TrustFeedbackForm } from "@/components/pil/TrustFeedbackForm";
import { Button } from "@/components/ui/button";
import { DEFAULT_PROMPT, ENHANCED_PROMPT } from "@/lib/pil-data";
import type { Assumption, ClarifyingQuestion, ContextField, Metric } from "@/lib/pil-data";
import { analyzePrompt, generateEnhancedPrompt } from "@/lib/pil.functions";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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

interface AnalysisState {
  score: number;
  status: string;
  fields: ContextField[];
  assumptions: Assumption[];
  questions: ClarifyingQuestion[];
  riskLevel: string;
  riskReason: string;
  suggestedEnhancedPrompt: string;
}

function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function Index() {
  const runAnalyze = useServerFn(analyzePrompt);
  const runEnhance = useServerFn(generateEnhancedPrompt);

  const [step, setStep] = useState<Step>("entry");
  const [loading, setLoading] = useState<Loading>(null);
  const [error, setError] = useState<string | null>(null);
  

  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [enhanced, setEnhanced] = useState(ENHANCED_PROMPT);
  const [pilEnabled, setPilEnabled] = useState(false);

  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [metrics, setMetrics] = useState<Metric[] | undefined>(undefined);
  const [messages, setMessages] = useState<
    { userPrompt: string; response: string; usedPil: boolean }[]
  >([]);
  const [followUpInput, setFollowUpInput] = useState("");

  // Saved conversations shown in the sidebar (kept in this browser).
  type SavedChat = { id: string; title: string; messages: typeof messages };
  const [chats, setChats] = useState<SavedChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pil-chats");
      if (raw) setChats(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Keep the active chat in the sidebar list in sync with the thread.
  useEffect(() => {
    if (messages.length === 0) return;
    const id = activeChatId ?? crypto.randomUUID();
    if (!activeChatId) setActiveChatId(id);
    setChats((prev) => {
      let next: SavedChat[];
      if (prev.some((c) => c.id === id)) {
        next = prev.map((c) => (c.id === id ? { ...c, messages } : c));
      } else {
        const title = messages[0].userPrompt.trim().slice(0, 60) || "New chat";
        next = [{ id, title, messages }, ...prev];
      }
      try {
        localStorage.setItem("pil-chats", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  function selectChat(id: string) {
    const chat = chats.find((c) => c.id === id);
    if (!chat) return;
    resetFlow();
    setActiveChatId(id);
    setMessages(chat.messages);
    setStep("response");
  }

  // Analysis-screen selections
  const [selectedContext, setSelectedContext] = useState<string[]>([]);
  const [contextValues, setContextValues] = useState<Record<string, string>>({});
  const [acceptedAssumptions, setAcceptedAssumptions] = useState<Record<string, boolean>>({});
  const [assumptionValues, setAssumptionValues] = useState<Record<string, string>>({});
  const [clarifyingAnswers, setClarifyingAnswers] = useState<Record<string, string>>({});

  const headerTitle = step === "review" ? "Enhanced Prompt Review" : "Prompt Intelligence Layer";

  function resetFlow() {
    setActiveChatId(null);
    setStep("entry");
    setPrompt(DEFAULT_PROMPT);
    setEnhanced(ENHANCED_PROMPT);
    setAnalysis(null);
    setMetrics(undefined);
    setMessages([]);
    setFollowUpInput("");
    setSelectedContext([]);
    setContextValues({});
    setAcceptedAssumptions({});
    setAssumptionValues({});
    setClarifyingAnswers({});
    setError(null);
  }

  // Submit from screen 1: if "Prompting" is on, run the intelligence flow;
  // otherwise generate the response directly.
  async function handleSubmit() {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    if (pilEnabled) {
      await handleAnalyze();
    } else {
      await handleGenerate(prompt);
    }
  }

  async function streamAnswer(userPrompt: string, sendPrompt: string, usedPil: boolean) {
    setError(null);
    setLoading("generating");
    let started = false;
    try {
      const res = await fetch("/api/answer-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: sendPrompt }),
      });
      if (!res.ok || !res.body) {
        throw new Error((await res.text().catch(() => "")) || "Could not reach Gemini. Please try again.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        if (!started) {
          started = true;
          setMessages((p) => [...p, { userPrompt, response: text, usedPil }]);
          setStep("response");
          setLoading(null);
        } else {
          const t = text;
          setMessages((p) => p.map((m, i) => (i === p.length - 1 ? { ...m, response: t } : m)));
        }
      }
      if (!started) throw new Error("Gemini returned no answer. Please try again.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not reach Gemini. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleFollowUp() {
    const text = followUpInput.trim();
    if (!text) return;
    setFollowUpInput("");
    if (pilEnabled) {
      await handleAnalyze(text);
      return;
    }
    await streamAnswer(text, text, false);
  }

  async function handleAnalyze(overridePrompt?: string) {
    const source = (overridePrompt ?? prompt).trim();
    if (!source) {
      setError("Please enter a prompt to analyze.");
      return;
    }
    if (overridePrompt) setPrompt(overridePrompt);
    setError(null);
    setLoading("analyzing");
    try {
      const raw = await runAnalyze({ data: { originalPrompt: source } });
      const res = analyzeNormalize(raw);
      setAnalysis(res);
      setSelectedContext(res.fields.map((f) => f.key));
      setContextValues(Object.fromEntries(res.fields.map((f) => [f.key, ""])));
      setAcceptedAssumptions({});
      setAssumptionValues({});
      setClarifyingAnswers({});
      setStep("analysis");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not reach Gemini. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleEnhance() {
    if (!analysis) return;
    setError(null);
    setLoading("enhancing");
    try {
      const accepted = analysis.assumptions
        .filter((a) => acceptedAssumptions[a.id])
        .map((a) => assumptionValues[a.id] ?? a.text);
      const changed: Record<string, string> = {};
      analysis.assumptions.forEach((a) => {
        if (assumptionValues[a.id] && assumptionValues[a.id] !== a.text) {
          changed[a.text] = assumptionValues[a.id];
        }
      });
      const contextAnswers: Record<string, string> = {};
      analysis.fields.forEach((f) => {
        if (selectedContext.includes(f.key) && contextValues[f.key]) {
          contextAnswers[f.label] = contextValues[f.key];
        }
      });
      const clarifying: Record<string, string> = {};
      analysis.questions.forEach((q) => {
        if (clarifyingAnswers[q.id]) clarifying[q.text] = clarifyingAnswers[q.id];
      });

      const res = await runEnhance({
        data: {
          originalPrompt: prompt,
          selectedMissingContext: selectedContext
            .map((k) => analysis.fields.find((f) => f.key === k)?.label ?? k),
          contextAnswers,
          acceptedAssumptions: accepted,
          changedAssumptions: changed,
          clarifyingAnswers: clarifying,
        },
      });
      setEnhanced(res.enhancedPrompt);
      setMetrics(res.metrics);
      setStep("review");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not reach Gemini. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleGenerate(chosenPrompt: string) {
    const usedPil = pilEnabled;
    await streamAnswer(usedPil ? prompt : chosenPrompt, chosenPrompt, usedPil);
  }

  const toggleContext = (key: string) =>
    setSelectedContext((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <ChatSidebar
        onNewChat={resetFlow}
        chats={chats.map((c) => ({ id: c.id, title: c.title }))}
        activeId={activeChatId}
        onSelect={selectChat}
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
                  Turn on <span className="font-medium text-foreground">Prompting</span> to analyze and
                  improve your prompt first, or send directly to generate a response.
                </p>
              </div>

              <div className="mt-8">
                <PromptInputBar
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={handleSubmit}
                  promptIntelligenceEnabled={pilEnabled}
                  onTogglePromptIntelligence={() => setPilEnabled((p) => !p)}
                />
              </div>
            </div>
          )}

          {/* STATE 2 */}
          {!loading && step === "analysis" && analysis && (
            <div className="mx-auto max-w-3xl space-y-5">
              <MissingContextSelector
                fields={analysis.fields}
                selected={selectedContext}
                values={contextValues}
                onToggle={toggleContext}
                onChange={(k, v) => setContextValues((p) => ({ ...p, [k]: v }))}
              />
              <AssumptionCards
                assumptions={analysis.assumptions}
                accepted={acceptedAssumptions}
                values={assumptionValues}
                onAccept={(id) => setAcceptedAssumptions((p) => ({ ...p, [id]: true }))}
                onChange={(id, v) => setAssumptionValues((p) => ({ ...p, [id]: v }))}
              />
              <ClarifyingQuestionCards
                questions={analysis.questions}
                answers={clarifyingAnswers}
                onAnswer={(id, v) => setClarifyingAnswers((p) => ({ ...p, [id]: v }))}
              />
              <ReliabilityRiskCard level={analysis.riskLevel} reason={analysis.riskReason} />

              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={handleEnhance}>
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
              onOriginalChange={setPrompt}
              onEnhancedChange={setEnhanced}
              onGenerate={handleGenerate}
              metrics={metrics}
            />
          )}

          {/* STATE 4 */}
          {!loading && step === "response" && (
            <div className="mx-auto flex h-full max-w-3xl flex-col">
              <div className="flex-1 space-y-6 overflow-y-auto pb-4">
                {messages.map((m, i) => (
                  <FinalResponseCard
                    key={i}
                    enhancedPrompt={m.userPrompt}
                    response={m.response}
                    showEnhancedBadge={m.usedPil}
                  />
                ))}
                {messages.some((m) => m.usedPil) && (
                  <TrustFeedbackForm originalPrompt={prompt} enhancedPrompt={enhanced} />
                )}
              </div>
              <div className="sticky bottom-0 bg-background pt-2">
                <PromptInputBar
                  value={followUpInput}
                  onChange={setFollowUpInput}
                  onSubmit={handleFollowUp}
                  promptIntelligenceEnabled={pilEnabled}
                  onTogglePromptIntelligence={() => setPilEnabled((p) => !p)}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

type AnalyzeResponse = Awaited<ReturnType<typeof analyzePrompt>>;

function analyzeNormalize(res: AnalyzeResponse): AnalysisState {
  return {
    score: res.score,
    status: res.status,
    fields: res.missingContext.map((c) => ({
      key: c.key,
      label: c.label,
      placeholder: `Enter ${c.label.toLowerCase()}`,
      defaultValue: "",
    })),
    assumptions: res.assumptions.map((text, i) => ({ id: `a${i}`, text })),
    questions: res.clarifyingQuestions.map((text, i) => ({ id: `q${i}`, text })),
    riskLevel: res.riskLevel,
    riskReason: res.riskReason,
    suggestedEnhancedPrompt: res.suggestedEnhancedPrompt,
  };
}
