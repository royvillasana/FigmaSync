/**
 * WebSocket client — connects the plugin to the UxBridge backend.
 * Runs in the plugin sandbox (not the UI iframe).
 */

import type { BatchFlushPayload, BatchFlushResponse, WSMessage } from "@uxbridge/types";

export type WSClientState = "connecting" | "connected" | "disconnected" | "error";

export interface WSClientCallbacks {
  onConnected: () => void;
  onDisconnected: () => void;
  onFlushResponse: (response: BatchFlushResponse) => void;
  onError: (error: string) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private callbacks: WSClientCallbacks;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(wsUrl: string, callbacks: WSClientCallbacks) {
    this.wsUrl = wsUrl;
    this.callbacks = callbacks;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.callbacks.onConnected();
    };

    this.ws.onclose = () => {
      this.callbacks.onDisconnected();
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.callbacks.onError("WebSocket connection error");
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const message = JSON.parse(event.data) as WSMessage;
        if (message.type === "PR_CREATED" || message.type === "BRANCH_CREATED") {
          const response = message.payload as BatchFlushResponse;
          this.callbacks.onFlushResponse(response);
        }
      } catch {
        // Ignore malformed messages
      }
    };
  }

  sendFlush(payload: BatchFlushPayload): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      this.callbacks.onError("Not connected to backend");
      return;
    }
    const message: WSMessage<BatchFlushPayload> = {
      type: "BATCH_FLUSH",
      payload,
      timestamp: Date.now(),
      messageId: crypto.randomUUID(),
    };
    this.ws.send(JSON.stringify(message));
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30_000);
    setTimeout(() => this.connect(), delay);
  }
}
