import { useState } from "react";
import { Sparkles, Zap, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { REVIEW_QUESTIONS, type Metric } from "@/lib/pil-data";
import { ImprovementMetrics } from "./ImprovementMetrics";

interface Props {
  originalPrompt: string;
  enhancedPrompt: string;
  onOriginalChange: (v: string) => void;
  onEnhancedChange: (v: string) => void;
  onGenerate: (chosenPrompt: string) => void;
  metrics?: Metric[];
}

type Choice = "original" | "enhanced";

export function EnhancedPromptReview({
  originalPrompt,
  enhancedPrompt,
  onOriginalChange,
  onEnhancedChange,
  onGenerate,
  metrics,
}: Props) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [selected, setSelected] = useState<Choice>("enhanced");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-semibold">
          <Sparkles className="size-6 text-warning" />
          Prompt Optimization Complete
        </h2>
        <p className="mt-1 text-muted-foreground">
          Edit and select which prompt to use before generating the response.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setSelected("original")}
          className={cn(
            "rounded-2xl border bg-card p-5 text-left transition-colors",
            selected === "original" ? "border-primary ring-1 ring-primary/40" : "border-border",
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Original Prompt (with edits)
            </p>
            {selected === "original" ? (
              <CheckCircle2 className="size-5 text-primary" />
            ) : (
              <Circle className="size-5 text-muted-foreground" />
            )}
          </div>
          <textarea
            value={originalPrompt}
            onChange={(e) => onOriginalChange(e.target.value)}
            onFocus={() => setSelected("original")}
            rows={6}
            className="mt-3 w-full resize-none rounded-lg border border-input bg-background/40 p-3 text-sm leading-relaxed focus:border-primary focus:outline-none"
          />
        </button>

        <button
          type="button"
          onClick={() => setSelected("enhanced")}
          className={cn(
            "rounded-2xl border bg-primary/5 p-5 text-left transition-colors",
            selected === "enhanced" ? "border-primary ring-1 ring-primary/40" : "border-primary/40",
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Enhanced Prompt</p>
            {selected === "enhanced" ? (
              <CheckCircle2 className="size-5 text-primary" />
            ) : (
              <Circle className="size-5 text-muted-foreground" />
            )}
          </div>
          <textarea
            value={enhancedPrompt}
            onChange={(e) => onEnhancedChange(e.target.value)}
            onFocus={() => setSelected("enhanced")}
            rows={6}
            className="mt-3 w-full resize-none rounded-lg border border-input bg-background/40 p-3 text-sm leading-relaxed focus:border-primary focus:outline-none"
          />
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-warning" />
          <span className="font-medium">Prompt Intelligence</span>
          <span className="text-sm text-muted-foreground">— Any addition required?</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {REVIEW_QUESTIONS.filter((q) => !dismissed.includes(q.id)).map((q) => (
            <button
              key={q.id}
              onClick={() => setDismissed((p) => [...p, q.id])}
              className="rounded-full border border-primary/50 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/10"
            >
              {q.text}
            </button>
          ))}
          {dismissed.length === REVIEW_QUESTIONS.length && (
            <span className="text-sm text-muted-foreground">All questions addressed.</span>
          )}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Click a question to dismiss it, or answer it in the prompt before generating.
        </p>
      </div>

      <ImprovementMetrics metrics={metrics} />

      <div className="flex flex-wrap gap-3">
        <Button
          size="lg"
          onClick={() => onGenerate(selected === "original" ? originalPrompt : enhancedPrompt)}
        >
          Generate Response <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
