/**
 * WebSocket client — connects the plugin to the UxBridge backend.
 * Runs in the plugin sandbox (not the UI iframe).
 */
import type { BatchFlushPayload, BatchFlushResponse } from "@uxbridge/types";
export type WSClientState = "connecting" | "connected" | "disconnected" | "error";
export interface WSClientCallbacks {
    onConnected: () => void;
    onDisconnected: () => void;
    onFlushResponse: (response: BatchFlushResponse) => void;
    onError: (error: string) => void;
}
export declare class WebSocketClient {
    private ws;
    private wsUrl;
    private callbacks;
    private reconnectAttempts;
    private maxReconnectAttempts;
    constructor(wsUrl: string, callbacks: WSClientCallbacks);
    connect(): void;
    sendFlush(payload: BatchFlushPayload): void;
    disconnect(): void;
    private scheduleReconnect;
}
//# sourceMappingURL=websocket-client.d.ts.map