export type AIOperationType = "visual_analysis" | "code_generation" | "token_diff" | "storybook_parsing" | "conflict_resolution";
/** Default model assignments per operation type */
export declare const MODEL_ASSIGNMENTS: Record<AIOperationType, {
    primary: string;
    fallback: string;
}>;
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
    requiresReview: boolean;
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
//# sourceMappingURL=ai.d.ts.map