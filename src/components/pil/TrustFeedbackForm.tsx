import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrustFeedbackForm() {
  const [rating, setRating] = useState(0);
  const [verify, setVerify] = useState<string>("");
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-5 text-primary">
        <CheckCircle2 className="size-5" />
        <span className="font-medium">Thanks — your feedback was submitted.</span>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-medium">How reliable did this response feel?</h3>
      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className={`flex size-10 items-center justify-center rounded-lg border transition-colors ${
              n <= rating
                ? "border-warning bg-warning/15 text-warning"
                : "border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            <Star className={`size-5 ${n <= rating ? "fill-current" : ""}`} />
          </button>
        ))}
      </div>

      <h3 className="mt-6 font-medium">Did this reduce your need to verify the response?</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Yes", "Somewhat", "No"].map((opt) => (
          <button
            key={opt}
            onClick={() => setVerify(opt)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              verify === opt
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary hover:bg-accent"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Optional comments"
        rows={3}
        className="mt-6 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />

      <Button className="mt-4" disabled={!rating || !verify} onClick={() => setSubmitted(true)}>
        Submit Feedback
      </Button>
    </section>
  );
}
