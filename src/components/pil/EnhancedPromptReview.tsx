import { useState } from "react";
import { Sparkles, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REVIEW_QUESTIONS } from "@/lib/pil-data";
import { ImprovementMetrics } from "./ImprovementMetrics";

interface Props {
  originalPrompt: string;
  enhancedPrompt: string;
  onEnhancedChange: (v: string) => void;
  onGenerate: () => void;
  onEdit: () => void;
}

export function EnhancedPromptReview({
  originalPrompt,
  enhancedPrompt,
  onEnhancedChange,
  onGenerate,
  onEdit,
}: Props) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-semibold">
          <Sparkles className="size-6 text-warning" />
          Prompt Optimization Complete
        </h2>
        <p className="mt-1 text-muted-foreground">
          Review the upgraded prompt before generating the response.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Original Prompt
          </p>
          <p className="mt-3 text-sm leading-relaxed">{originalPrompt}</p>
        </div>
        <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Enhanced Prompt</p>
          <textarea
            value={enhancedPrompt}
            onChange={(e) => onEnhancedChange(e.target.value)}
            rows={6}
            className="mt-3 w-full resize-none rounded-lg border border-input bg-background/40 p-3 text-sm leading-relaxed focus:border-primary focus:outline-none"
          />
        </div>
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

      <ImprovementMetrics />

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={onGenerate}>
          Generate Response <ArrowRight className="size-4" />
        </Button>
        <Button size="lg" variant="outline" onClick={onEdit}>
          Edit Prompt
        </Button>
      </div>
    </div>
  );
}
