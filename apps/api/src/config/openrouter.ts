import OpenAI from "openai";

import type { AIOperationType } from "@uxbridge/types";
import { MODEL_ASSIGNMENTS } from "@uxbridge/types";

import { env } from "./env.js";

/** OpenAI-compatible client pointed at OpenRouter */
export const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": env.APP_URL,
    "X-Title": "Figma-GitHub Sync",
  },
});

/**
 * Resolve the model to use for a given operation type.
 * If the workspace has a custom model configured, use that.
 * Otherwise fall back to the default assignment from MODEL_ASSIGNMENTS.
 */
export function resolveModel(
  operation: AIOperationType,
  workspaceModelOverride?: string | null,
): string {
  if (workspaceModelOverride) return workspaceModelOverride;
  return MODEL_ASSIGNMENTS[operation].primary;
}
