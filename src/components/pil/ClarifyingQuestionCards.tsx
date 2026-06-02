import { useState } from "react";
import { CLARIFYING_QUESTIONS } from "@/lib/pil-data";

export function ClarifyingQuestionCards() {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-medium">Clarifying Questions</h3>
      <p className="mt-1 text-sm text-muted-foreground">Click a question to answer it.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {CLARIFYING_QUESTIONS.map((q) => {
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
        {CLARIFYING_QUESTIONS.filter((q) => open[q.id]).map((q) => (
          <div key={q.id}>
            <label className="text-xs text-muted-foreground">{q.text}</label>
            <input
              autoFocus
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
              placeholder="Your answer"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
