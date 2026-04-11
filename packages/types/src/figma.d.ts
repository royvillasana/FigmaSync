export interface FigmaNode {
    id: string;
    name: string;
    type: string;
    children?: FigmaNode[];
}
export interface FigmaFileMetadata {
    key: string;
    name: string;
    lastModified: string;
    thumbnailUrl: string;
    version: string;
}
export interface FigmaVersion {
    id: string;
    created_at: string;
    label: string | null;
    description: string | null;
}
/** Payload for creating a staging section in Figma */
export interface StagingProposal {
    figmaFileKey: string;
    prNumber: number;
    prTitle: string;
    changes: StagingChange[];
}
export interface StagingChange {
    nodeId: string;
    nodeName: string;
    annotations: string[];
    proposedProperties: Record<string, unknown>;
}
/** MCP config for figma-console-mcp */
export interface FigmaConsoleMcpConfig {
    command: "npx";
    args: string[];
    env: {
        FIGMA_ACCESS_TOKEN: string;
        ENABLE_MCP_APPS: string;
    };
}
//# sourceMappingURL=figma.d.ts.map