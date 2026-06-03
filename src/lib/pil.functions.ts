import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  analyzePromptLogic,
  generateEnhancedPromptLogic,
  generateFinalResponseLogic,
} from "./pil.server";

// 1. analyzePrompt — evaluate prompt quality
export const analyzePrompt = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      originalPrompt: z.string().min(1).max(5000),
    }),
  )
  .handler(async ({ data }) => {
    return analyzePromptLogic(data.originalPrompt);
  });

// 2. generateEnhancedPrompt — rewrite into a clearer prompt
export const generateEnhancedPrompt = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      originalPrompt: z.string().min(1).max(5000),
      selectedMissingContext: z.array(z.string().max(200)).max(50).optional(),
      contextAnswers: z.record(z.string(), z.string().max(2000)).optional(),
      acceptedAssumptions: z.array(z.string().max(500)).max(50).optional(),
      changedAssumptions: z.record(z.string(), z.string().max(500)).optional(),
      clarifyingAnswers: z.record(z.string(), z.string().max(2000)).optional(),
    }),
  )
  .handler(async ({ data }) => {
    return generateEnhancedPromptLogic(data);
  });

// 3. generateFinalResponse — produce the final AI answer
export const generateFinalResponse = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      enhancedPrompt: z.string().min(1).max(8000),
    }),
  )
  .handler(async ({ data }) => {
    return generateFinalResponseLogic(data.enhancedPrompt);
  });

// 4. submitFeedback — capture MVP feedback
export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      originalPrompt: z.string().max(5000).optional(),
      enhancedPrompt: z.string().max(8000).optional(),
      trustRating: z.number().min(0).max(5),
      reducedVerification: z.string().max(50),
      comments: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    // MVP: log feedback server-side. Swap for DB persistence later.
    console.log("PIL feedback received:", {
      trustRating: data.trustRating,
      reducedVerification: data.reducedVerification,
      hasComments: Boolean(data.comments),
    });
    return { success: true, message: "Thanks — your feedback was submitted." };
  });
