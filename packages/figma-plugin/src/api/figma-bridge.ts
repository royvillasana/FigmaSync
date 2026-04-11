/**
 * Figma bridge — postMessage communication between plugin sandbox and UI iframe.
 * The sandbox (code.ts) and UI (ui.tsx) can only communicate via postMessage.
 */

import type { BatchConfig, BatchFlushPayload, PluginState } from "@uxbridge/types";

// Messages from sandbox → UI
export type SandboxToUIMessage =
  | { type: "STATE_UPDATE"; state: PluginState; pendingCount: number; highCount: number; summary: Array<{ name: string; significance: string; properties: string[] }>; inactivityMs: number; projectId: string }
  | { type: "WS_READY" }
  | { type: "SYNC_COMPLETE"; prUrl: string; prNumber: number; branchName: string }
  | { type: "SYNC_ERROR"; message: string }
  | { type: "CONFIG_LOADED"; config: BatchConfig }
  | { type: "FLUSH_PAYLOAD"; payload: BatchFlushPayload };

// Messages from UI → sandbox
export type UIToSandboxMessage =
  | { type: "TRIGGER_MANUAL_SYNC" }
  | { type: "DISCARD_CHANGES" }
  | { type: "REQUEST_STATE" }
  | { type: "CONNECT_PROJECT"; projectId: string }
  | { type: "DISCONNECT_PROJECT" }
  | { type: "WS_READY" }
  | { type: "WS_RESPONSE"; status: "ok" | "error"; prUrl?: string; prNumber?: number; branchName?: string; errorMessage?: string };

/** Send a message from sandbox to the UI iframe */
export function sendToUI(message: SandboxToUIMessage): void {
  figma.ui.postMessage(message);
}

/** Register a handler for messages coming from the UI iframe (in sandbox context) */
export function onUIMessage(handler: (msg: UIToSandboxMessage) => void): void {
  figma.ui.onmessage = (msg: unknown) => {
    handler(msg as UIToSandboxMessage);
  };
}

/** Send a message from UI iframe to the sandbox (in UI context) */
export function sendToSandbox(message: UIToSandboxMessage): void {
  parent.postMessage({ pluginMessage: message }, "*");
}

/** Register a handler for messages from the sandbox (in UI context) */
export function onSandboxMessage(handler: (msg: SandboxToUIMessage) => void): void {
  window.onmessage = (event: MessageEvent) => {
    if (event.data.pluginMessage) {
      handler(event.data.pluginMessage as SandboxToUIMessage);
    }
  };
}
