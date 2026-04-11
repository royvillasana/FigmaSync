// WebSocket event type constants — single source of truth
export const WS_EVENTS = {
  PLUGIN_CONNECTED: "PLUGIN_CONNECTED",
  BATCH_FLUSH: "BATCH_FLUSH",
  BRANCH_CREATED: "BRANCH_CREATED",
  PR_CREATED: "PR_CREATED",
  PR_MERGED: "PR_MERGED",
  SYNC_ERROR: "SYNC_ERROR",
  STAGING_READY: "STAGING_READY",
  FIGMA_UPDATED: "FIGMA_UPDATED",
  HEARTBEAT: "HEARTBEAT",
  ACK: "ACK",
} as const;

export type WSEventType = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];
