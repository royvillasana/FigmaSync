import type { IncomingMessage } from "http";
import type { Server } from "http";

import type { BatchFlushPayload, WSMessage } from "@uxbridge/types";
import { WebSocketServer, WebSocket } from "ws";

import { WS_EVENTS } from "./ws-events.js";

/** Registry of active plugin connections keyed by projectId */
const connections = new Map<string, WebSocket>();

export function createWSServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    const projectId = url.searchParams.get("projectId") ?? "unknown";

    connections.set(projectId, ws);
    console.log(`[WS] Plugin connected: projectId=${projectId}`);

    ws.on("message", (raw: Buffer) => {
      try {
        const message = JSON.parse(raw.toString()) as WSMessage;
        handleMessage(projectId, message, ws);
      } catch {
        console.warn("[WS] Malformed message received");
      }
    });

    ws.on("close", () => {
      connections.delete(projectId);
      console.log(`[WS] Plugin disconnected: projectId=${projectId}`);
    });

    ws.on("error", (err) => {
      console.error(`[WS] Error for projectId=${projectId}:`, err.message);
    });

    // Send ACK
    send(ws, { type: WS_EVENTS.ACK, payload: { projectId }, timestamp: Date.now(), messageId: crypto.randomUUID() });
  });

  return wss;
}

/** Send a structured message to a specific project's plugin */
export function notifyPlugin(projectId: string, message: WSMessage): void {
  const ws = connections.get(projectId);
  if (ws?.readyState === WebSocket.OPEN) {
    send(ws, message);
  }
}

function send(ws: WebSocket, message: WSMessage): void {
  ws.send(JSON.stringify(message));
}

function handleMessage(projectId: string, message: WSMessage, ws: WebSocket): void {
  console.log(`[WS] Message received: type=${message.type} projectId=${projectId}`);
  if (message.type === WS_EVENTS.BATCH_FLUSH) {
    const payload = message.payload as BatchFlushPayload;
    console.log(`[WS] Batch flush: ${payload.changes?.length ?? 0} changes, figmaFileKey=${payload.figmaFileKey}`);
    import("../sync/sync-engine.js").then(({ processBatchFlush }) => {
      processBatchFlush(payload, projectId).catch((err: Error) => {
        console.error(`[WS] Sync error for projectId=${projectId}:`, err.message);
        notifyPlugin(projectId, {
          type: WS_EVENTS.SYNC_ERROR,
          payload: { batchId: null, errorCode: "FLUSH_FAILED", errorMessage: err.message, retryable: true },
          timestamp: Date.now(),
          messageId: crypto.randomUUID(),
        });
      });
    }).catch((err: Error) => {
      console.error("[WS] Failed to import sync-engine:", err.message);
    });
  } else if (message.type === WS_EVENTS.HEARTBEAT) {
    send(ws, { type: WS_EVENTS.HEARTBEAT, payload: {}, timestamp: Date.now(), messageId: crypto.randomUUID() });
  }
}
