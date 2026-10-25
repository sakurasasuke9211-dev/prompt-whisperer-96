# Prompt Intelligence Layer

An AI chat interface that optionally analyzes and enhances your prompts before generating responses — reducing assumptions, surfacing missing context, and improving output trust.

## Live Demo: https://prompt-whisperer-96.lovable.app

## Overview

Prompt Intelligence Layer (PIL) sits between you and the AI. When enabled, it:

1. **Analyzes** your prompt for clarity, missing context, and hidden assumptions
2. **Surfaces** context fields, assumptions, and clarifying questions
3. **Enhances** your prompt into a clearer, more complete version
4. **Generates** a higher-trust response with fewer verification needs

When disabled, it works like a standard AI chat tool.

## Features

- **Toggle-able Prompt Intelligence** — Turn analysis/enhancement on or off per message
- **Prompt Quality Analysis** — Score, missing context detection, assumption surfacing, reliability risk assessment
- **Interactive Enhancement** — Select context to include, accept/edit assumptions, answer clarifying questions
- **Enhanced Prompt Review** — Side-by-side comparison with improvement metrics
- **Continuous Chat Thread** — Follow-up messages maintain conversation context
- **Trust Feedback** — Rate output trust and verification reduction after PIL-enhanced responses

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19 + Vite 7)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **State:** React state + TanStack Query
- **Server:** TanStack `createServerFn` (serverless Worker runtime)
- **AI Backend:** Gemini 3.8 Flash through Lovable AI (workspace-credit billing)
- **Language:** TypeScript (strict)

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx           # Root layout (HTML shell, error boundaries)
│   ├── index.tsx            # Main app — chat UI, state machine, 4-step flow
│   └── api/                 # Public API routes (if any)
├── components/
│   ├── ui/                  # shadcn/ui primitives (Button, Card, Input, etc.)
│   └── pil/                 # PIL-specific components
│       ├── AppHeader.tsx
│       ├── ChatSidebar.tsx
│       ├── PromptInputBar.tsx
│       ├── MissingContextSelector.tsx
│       ├── AssumptionCards.tsx
│       ├── ClarifyingQuestionCards.tsx
│       ├── EnhancedPromptReview.tsx
│       ├── FinalResponseCard.tsx
│       ├── ReliabilityRiskCard.tsx
│       ├── TrustFeedbackForm.tsx
│       └── ...
├── lib/
│   ├── pil-data.ts          # Static data, types, defaults
│   ├── pil.server.ts        # Core AI logic (Gemini-backed)
│   ├── pil.functions.ts     # createServerFn wrappers (client-safe imports)
│   ├── gemini.server.ts     # Gemini client (server-only)
│   ├── ai-provider.server.ts # Request-local AI provider
│   └── ai-run-id.server.ts  # Gateway request correlation
├── styles.css               # Tailwind v4 entry + theme tokens
└── router.tsx               # TanStack Router setup
```

## Architecture

### 4-Step Flow

The UI is a state machine with four steps:

| Step | Screen | Description |
|------|--------|-------------|
| `entry` | Prompt input | User types a prompt; toggle PIL on/off |
| `analysis` | Context & assumptions | AI-analyzed results; user fills gaps |
| `review` | Enhanced prompt | Side-by-side original vs. enhanced; metrics |
| `response` | Chat thread | Generated response; follow-up input |

### Server Functions

All AI calls go through `createServerFn` RPC:

- `analyzePrompt` — Evaluates prompt quality, returns score, missing context, assumptions, risk
- `generateEnhancedPrompt` — Rewrites prompt using user-provided context/answers
- `generateFinalResponse` — Generates the final AI answer from the (enhanced) prompt
- `submitFeedback` — Captures trust ratings (logs server-side; DB-ready)

### Security

- **Lovable AI key** is managed securely (`LOVABLE_API_KEY`), never in code; Groq secrets are no longer used
- Server-only files (`*.server.ts`) are stripped from client bundles automatically
- No hardcoded secrets in the repository

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- A configured Lovable AI connection and workspace AI credits

### Install

```bash
bun install
```

### Environment

The Lovable AI key is managed via Lovable Secret Manager. For local development, supply it through your server environment; never commit its value:

```bash
export LOVABLE_API_KEY="your_local_server_key"
```

All three AI operations use `google/gemini-3.8-flash` through Lovable AI. Requests stream server-side; failures produce errors, never demo answers.

### Run Dev Server

```bash
bun run dev
```

The app will be available at `http://localhost:3000` (or the port shown in the terminal).

### Build

```bash
bun run build
```

### Lint & Format

```bash
bun run lint
bun run format
```

## Key Files

| File | Purpose |
|------|---------|
| `src/routes/index.tsx` | Main application — state machine, all 4 steps, chat thread |
| `src/lib/pil.server.ts` | Core AI orchestration (analyze → enhance → respond) |
| `src/lib/gemini.server.ts` | Server-only Gemini calls with JSON-safe parsing |
| `src/lib/pil.functions.ts` | Typed `createServerFn` RPC definitions |
| `src/components/pil/PromptInputBar.tsx` | Input bar with PIL toggle |
| `src/components/pil/EnhancedPromptReview.tsx` | Side-by-side prompt comparison |
| `src/components/pil/FinalResponseCard.tsx` | Response rendering in chat thread |

## Customization

### Change the Default Prompt

Edit `DEFAULT_PROMPT` in `src/lib/pil-data.ts`:

```ts
export const DEFAULT_PROMPT = "Your default prompt here";
```

### Change the AI Model

Update the model identifier in the server-only Gemini helper after confirming availability in the authenticated Lovable AI catalog.

### Add Database Persistence

Currently, feedback is logged server-side. To persist to a database:

1. **Lovable Cloud** is already enabled (built-in database, storage, and optional auth)
2. Add a `feedback` table via migration
3. Replace the `console.log` in `submitFeedback` handler with a `supabase` insert

## License

Private — built with [Lovable](https://lovable.dev).
