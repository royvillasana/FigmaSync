import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { onSandboxMessage, sendToSandbox } from "./api/figma-bridge.js";
import type { SandboxToUIMessage, UIToSandboxMessage } from "./api/figma-bridge.js";
import type { BatchFlushPayload, BatchFlushResponse, PluginState, WSMessage } from "@uxbridge/types";

import { AcumulandoState } from "./ui/states/AcumulandoState.js";
import { CompletadoState } from "./ui/states/CompletadoState.js";
import { ErrorState } from "./ui/states/ErrorState.js";
import { IdleState } from "./ui/states/IdleState.js";
import { ListoState } from "./ui/states/ListoState.js";
import { NotConnectedState } from "./ui/states/NotConnectedState.js";
import { SincronizandoState } from "./ui/states/SincronizandoState.js";

const WS_BASE_URL = "ws://localhost:3001/ws";

function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

interface AppState {
  state: PluginState;
  projectId: string;
  pendingCount: number;
  highCount: number;
  summary: Array<{ name: string; significance: string; properties: string[] }>;
  inactivityMs: number;
  lastPR: { url: string; number: number; branch: string } | null;
  errorMessage: string | null;
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    state: "NOT_CONNECTED",
    projectId: "",
    pendingCount: 0,
    highCount: 0,
    summary: [],
    inactivityMs: 0,
    lastPR: null,
    errorMessage: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const [wsConnected, setWsConnected] = useState(false);
  // Ref so reconnect callbacks always see the latest projectId (avoids stale closure)
  const projectIdRef = useRef<string>("");

  function connectWS(projectId?: string) {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const pid = projectId ?? projectIdRef.current;
    const url = pid ? `${WS_BASE_URL}?projectId=${encodeURIComponent(pid)}` : WS_BASE_URL;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttempts.current = 0;
      setWsConnected(true);
      // Notify sandbox that WS is ready — recover from "Not connected" error
      sendToSandbox({ type: "WS_READY" } as UIToSandboxMessage);
    };

    ws.onclose = () => {
      setWsConnected(false);
      // Keep retrying indefinitely with capped backoff
      reconnectAttempts.current++;
      const delay = Math.min(1000 * 2 ** Math.min(reconnectAttempts.current, 5), 30_000);
      reconnectTimer.current = setTimeout(connectWS, delay);
    };

    ws.onerror = () => {
      // Will trigger onclose for reconnect
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const message = JSON.parse(event.data) as WSMessage;
        if (message.type === "PR_CREATED" || message.type === "BRANCH_CREATED") {
          const response = message.payload as BatchFlushResponse;
          const wsResponse: UIToSandboxMessage = {
            type: "WS_RESPONSE",
            status: response.status === "error" ? "error" : "ok",
            ...(response.prUrl ? { prUrl: response.prUrl } : {}),
            ...(response.prNumber != null ? { prNumber: response.prNumber } : {}),
            ...(response.branchName ? { branchName: response.branchName } : {}),
            ...(response.errorMessage ? { errorMessage: response.errorMessage } : {}),
          };
          sendToSandbox(wsResponse);
        } else if (message.type === "SYNC_ERROR") {
          const errPayload = message.payload as { errorMessage?: string };
          sendToSandbox({
            type: "WS_RESPONSE",
            status: "error",
            errorMessage: errPayload.errorMessage ?? "Sync failed",
          });
        }
      } catch {
        // ignore malformed
      }
    };
  }

  function sendFlush(payload: BatchFlushPayload) {
    const ws = wsRef.current;
    if (ws?.readyState !== WebSocket.OPEN) {
      sendToSandbox({ type: "WS_RESPONSE", status: "error", errorMessage: "Not connected to backend" });
      return;
    }
    const message: WSMessage<BatchFlushPayload> = {
      type: "BATCH_FLUSH",
      payload,
      timestamp: Date.now(),
      messageId: uuid(),
    };
    ws.send(JSON.stringify(message));
  }

  useEffect(() => {
    connectWS();

    onSandboxMessage((msg: SandboxToUIMessage) => {
      if (msg.type === "STATE_UPDATE") {
        // Keep ref in sync so reconnect callbacks always have the latest projectId
        if (msg.projectId && msg.projectId !== projectIdRef.current) {
          projectIdRef.current = msg.projectId;
          // Reconnect WS with projectId so server can route responses back to us.
          // Null out onclose first so the auto-reconnect logic doesn't fire a duplicate.
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.onclose = null;
            wsRef.current.close();
            connectWS(msg.projectId);
          }
        }
        setAppState((prev) => {
          return {
            ...prev,
            state: msg.state,
            projectId: msg.projectId,
            pendingCount: msg.pendingCount,
            highCount: msg.highCount,
            summary: msg.summary,
            inactivityMs: msg.inactivityMs,
          };
        });
      } else if (msg.type === "SYNC_COMPLETE") {
        setAppState((prev) => ({
          ...prev,
          state: "COMPLETADO",
          lastPR: { url: msg.prUrl, number: msg.prNumber, branch: msg.branchName },
          errorMessage: null,
        }));
      } else if (msg.type === "SYNC_ERROR") {
        setAppState((prev) => ({
          ...prev,
          state: "ERROR",
          errorMessage: msg.message,
        }));
      } else if (msg.type === "FLUSH_PAYLOAD") {
        sendFlush(msg.payload);
      }
    });

    sendToSandbox({ type: "REQUEST_STATE" });

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);

  const handleSyncNow = () => sendToSandbox({ type: "TRIGGER_MANUAL_SYNC" });
  const handleDiscard = () => sendToSandbox({ type: "DISCARD_CHANGES" });
  const handleConnect = (projectId: string) => {
    projectIdRef.current = projectId;
    sendToSandbox({ type: "CONNECT_PROJECT", projectId });
    // Reconnect WS with projectId in URL so server can route responses
    wsRef.current?.close();
    connectWS(projectId);
  };
  const handleDisconnect = () => sendToSandbox({ type: "DISCONNECT_PROJECT" });

  const { state, projectId, pendingCount, highCount, summary, inactivityMs, lastPR, errorMessage } = appState;

  return (
    <div style={{ padding: 16, height: "100vh", display: "flex", flexDirection: "column" }}>
      {!wsConnected && state !== "NOT_CONNECTED" && (
        <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 6, padding: "6px 10px", marginBottom: 10, fontSize: 11, color: "#92400E" }}>
          Conectando al servidor… asegúrate que el API está corriendo.
        </div>
      )}
      {state === "NOT_CONNECTED" && <NotConnectedState onConnect={handleConnect} />}
      {state === "IDLE" && <IdleState projectId={projectId} lastPR={lastPR} onDisconnect={handleDisconnect} />}
      {state === "ACUMULANDO" && (
        <AcumulandoState
          pendingCount={pendingCount}
          highCount={highCount}
          summary={summary}
          inactivityMs={inactivityMs}
          onSyncNow={handleSyncNow}
          onDiscard={handleDiscard}
        />
      )}
      {state === "LISTO" && (
        <ListoState
          pendingCount={pendingCount}
          summary={summary}
          onSyncNow={handleSyncNow}
          onDiscard={handleDiscard}
        />
      )}
      {state === "SINCRONIZANDO" && <SincronizandoState />}
      {state === "COMPLETADO" && lastPR && (
        <CompletadoState prUrl={lastPR.url} prNumber={lastPR.number} branchName={lastPR.branch} />
      )}
      {state === "ERROR" && (
        <ErrorState
          message={errorMessage ?? "Unknown error"}
          onRetry={handleSyncNow}
        />
      )}
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
