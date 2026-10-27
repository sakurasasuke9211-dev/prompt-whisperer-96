import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({ prompt: z.string().min(1).max(8000) });

export const Route = createFileRoute("/api/answer-stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Invalid request", { status: 400 });
        const { streamGeminiAnswer } = await import("@/lib/gemini.server");
        try {
          const stream = await streamGeminiAnswer(parsed.data.prompt);
          return new Response(stream, {
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
          });
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Gemini is temporarily unavailable.";
          return new Response(msg, { status: 502 });
        }
      },
    },
  },
});
