# Architecture

- Keep all LLM requests in server-only modules reached through TanStack server functions, so credentials never reach the browser.
- Use the request-local Lovable AI provider helper for Gemini calls; JSON steps consume streams server-side, while the final answer streams to the browser via the server route /api/answer-stream for word-by-word display.