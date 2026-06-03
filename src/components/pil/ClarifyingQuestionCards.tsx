import { useState } from "react";
import { CLARIFYING_QUESTIONS, type ClarifyingQuestion } from "@/lib/pil-data";

interface Props {
  questions?: ClarifyingQuestion[];
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
}

export function ClarifyingQuestionCards({ questions, answers, onAnswer }: Props) {
  const items = questions && questions.length > 0 ? questions : CLARIFYING_QUESTIONS;
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-medium">Clarifying Questions</h3>
      <p className="mt-1 text-sm text-muted-foreground">Click a question to answer it.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((q) => {
          const active = open[q.id];
          return (
            <button
              key={q.id}
              onClick={() => setOpen((p) => ({ ...p, [q.id]: !p[q.id] }))}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active || answers[q.id]
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary hover:bg-accent"
              }`}
            >
              {q.text}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {items.filter((q) => open[q.id]).map((q) => (
          <div key={q.id}>
            <label className="text-xs text-muted-foreground">{q.text}</label>
            <input
              autoFocus
              value={answers[q.id] ?? ""}
              onChange={(e) => onAnswer(q.id, e.target.value)}
              placeholder="Your answer"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
