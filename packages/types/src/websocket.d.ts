export type WSMessageType = "PLUGIN_CONNECTED" | "BATCH_FLUSH" | "SYNC_REQUEST_STATUS" | "BRANCH_CREATED" | "PR_CREATED" | "PR_MERGED" | "SYNC_ERROR" | "STAGING_READY" | "FIGMA_UPDATED" | "HEARTBEAT" | "ACK";
export interface WSMessage<T = unknown> {
    type: WSMessageType;
    payload: T;
    timestamp: number;
    messageId: string;
}
export interface PluginConnectedPayload {
    pluginVersion: string;
    figmaFileKey: string;
    projectId: string;
}
export interface BranchCreatedPayload {
    batchId: string;
    branchName: string;
    commitSha: string;
}
export interface PRCreatedPayload {
    batchId: string;
    prNumber: number;
    prUrl: string;
    branchName: string;
    changeCount: number;
}
export interface SyncErrorPayload {
    batchId: string | null;
    errorCode: string;
    errorMessage: string;
    retryable: boolean;
}
export interface StagingReadyPayload {
    prNumber: number;
    prTitle: string;
    stagingNodeIds: string[];
    previewUrl: string | null;
}
//# sourceMappingURL=websocket.d.ts.map