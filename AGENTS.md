# Architecture

- Keep all LLM requests in server-only modules reached through TanStack server functions, so credentials never reach the browser.
- Use the request-local Lovable AI provider helper for Gemini calls and consume streamed answers server-side, preserving the frontend response contract.