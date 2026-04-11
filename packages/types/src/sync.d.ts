export type ChangeSignificance = "HIGH" | "MEDIUM" | "LOW" | "IGNORE";
export type ChangeNodeType = "COMPONENT" | "COMPONENT_SET" | "VARIABLE" | "FRAME";
export type ChangeType = "CREATE" | "DELETE" | "PROPERTY_CHANGE";
/**
 * A single entry in the change buffer.
 * Key design: deduplication per nodeId — multiple edits to same node merge into one.
 */
export interface PendingChange {
    nodeId: string;
    nodeName: string;
    nodeType: ChangeNodeType;
    changeType: ChangeType;
    /** Union of all property names modified across multiple edits */
    changedProperties: string[];
    /** Timestamp of the first edit to this node in the current buffer window */
    firstSeenAt: number;
    /** Timestamp of the most recent edit — updated on each merge */
    lastSeenAt: number;
    significance: ChangeSignificance;
    /** True if the node is in the Design System page (not a regular design frame) */
    isInDSPage: boolean;
}
/**
 * Plugin UI states — the plugin panel always shows exactly one of these.
 * Transitions: IDLE → ACUMULANDO → LISTO → SINCRONIZANDO → COMPLETADO | ERROR → IDLE
 */
export type PluginState = "NOT_CONNECTED" | "IDLE" | "ACUMULANDO" | "LISTO" | "SINCRONIZANDO" | "COMPLETADO" | "ERROR";
/** How the batch flush was triggered */
export type BatchTrigger = "auto_inactivity" | "auto_threshold" | "manual" | "auto_timeout";
/** Payload sent from plugin to backend on flush */
export interface BatchFlushPayload {
    projectId: string;
    figmaFileKey: string;
    trigger: BatchTrigger;
    changes: PendingChange[];
    flushedAt: number;
}
/** Backend response after receiving a flush */
export interface BatchFlushResponse {
    batchId: string;
    branchName: string;
    prUrl: string | null;
    prNumber: number | null;
    status: "branch_created" | "pr_created" | "error";
    errorMessage: string | null;
}
/** Batch config per project (mirrors Project table fields) */
export interface BatchConfig {
    inactivityTimeoutMs: number;
    autoSyncThreshold: number;
    maxWaitTimeoutMs: number;
    minChangesForSync: number;
    syncMode: "auto" | "manual_only";
    ignoreLowSignificance: boolean;
    showCountdownTimer: boolean;
}
export declare const DEFAULT_BATCH_CONFIG: BatchConfig;
//# sourceMappingURL=sync.d.ts.map