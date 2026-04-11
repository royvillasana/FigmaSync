// =============================================================================
// AI / OpenRouter types
// =============================================================================

export type AIOperationType =
  | "visual_analysis"      // Gemini 2.5 Pro — componentize Figma screenshots
  | "code_generation"      // Claude 3.5 Sonnet — generate React component
  | "token_diff"           // Llama 3.3 — parse token diffs
  | "storybook_parsing"    // Gemini Flash — extract CSF metadata
  | "conflict_resolution"; // Claude 3.5 Sonnet — suggest merge resolution

/** Default model assignments per operation type */
export const MODEL_ASSIGNMENTS: Record<AIOperationType, { primary: string; fallback: string }> = {
  visual_analysis: {
    primary: "google/gemini-2.5-pro",
    fallback: "openai/gpt-4o",
  },
  code_generation: {
    primary: "anthropic/claude-3.5-sonnet",
    fallback: "openai/gpt-4o",
  },
  token_diff: {
    primary: "meta-llama/llama-3.3-70b-instruct",
    fallback: "mistralai/mixtral-8x7b",
  },
  storybook_parsing: {
    primary: "meta-llama/llama-3.3-70b-instruct",
    fallback: "google/gemini-flash-1.5",
  },
  conflict_resolution: {
    primary: "anthropic/claude-3.5-sonnet",
    fallback: "openai/gpt-4o",
  },
};

export interface AIAnalysisResult {
  components: ComponentProposal[];
  confidence: number;
  modelUsed: string;
}

export interface ComponentProposal {
  nodeId: string;
  nodeName: string;
  suggestedName: string;
  suggestedType: "COMPONENT" | "COMPONENT_SET";
  variants: VariantProposal[];
  confidence: number;
  requiresReview: boolean; // true if confidence < 0.70
}

export interface VariantProposal {
  figmaVariantName: string;
  codePropsEquivalent: Record<string, string>;
}

export interface GeneratedComponentCode {
  componentCode: string;
  figmaConnectCode: string;
  storybookStoryCode: string;
  modelUsed: string;
}
