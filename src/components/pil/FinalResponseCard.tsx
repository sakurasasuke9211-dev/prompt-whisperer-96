import { Sparkles, BadgeCheck } from "lucide-react";

interface Props {
  enhancedPrompt: string;
  response: string;
  showEnhancedBadge?: boolean;
}

export function FinalResponseCard({ enhancedPrompt, response, showEnhancedBadge = true }: Props) {
  return (
    <div className="space-y-4">
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-secondary p-4 text-sm leading-relaxed">
        {enhancedPrompt}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-background">
            <Sparkles className="size-4" />
          </span>
          {showEnhancedBadge && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
              <BadgeCheck className="size-3.5" /> Generated from enhanced prompt
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-foreground">{response}</p>
      </div>
    </div>
  );
}
