/**
 * UxBridge Figma Plugin — Sandbox entry point (code.ts)
 * Runs in the Figma plugin sandbox (no DOM access, no WebSocket).
 * WebSocket lives in the UI iframe — we send flush payloads there via postMessage.
 */

import type { BatchConfig, BatchFlushPayload, PluginState } from "@uxbridge/types";
import { DEFAULT_BATCH_CONFIG } from "@uxbridge/types";

import { onUIMessage, sendToUI } from "./api/figma-bridge.js";
import { BatchTriggerEngine } from "./core/batch-trigger.js";
import { ChangeBuffer } from "./core/change-buffer.js";
import { registerDocumentChangeListener } from "./core/event-listener.js";

figma.showUI(__html__, { width: 320, height: 480, title: "UxBridge Sync" });

// State — start NOT_CONNECTED until we confirm a projectId is stored
const savedProjectId = figma.root.getPluginData("projectId");
let pluginState: PluginState = savedProjectId ? "IDLE" : "NOT_CONNECTED";
const config: BatchConfig = DEFAULT_BATCH_CONFIG;

// Core subsystems
const buffer = new ChangeBuffer(config);

const triggerEngine = new BatchTriggerEngine(buffer, async (trigger) => {
  const changes = buffer.flush();
  if (changes.length === 0) return;

  setState("SINCRONIZANDO");

  const payload: BatchFlushPayload = {
    projectId: figma.root.getPluginData("projectId") ?? "",
    figmaFileKey: figma.fileKey ?? "",
    trigger,
    changes,
    flushedAt: Date.now(),
  };

  // Delegate WebSocket send to the UI iframe (sandbox has no WebSocket)
  sendToUI({ type: "FLUSH_PAYLOAD", payload });
}, config);

// Load all pages first (required by Figma before registering documentchange)
figma.loadAllPagesAsync().then(() => {
  registerDocumentChangeListener({
    buffer,
    triggerEngine,
    onStateChange: () => {
      const highCount = buffer.countBySignificance("HIGH");
      const shouldBeReady = highCount >= config.autoSyncThreshold;
      setState(shouldBeReady ? "LISTO" : "ACUMULANDO");
      broadcastState();
    },
  });
}).catch((err: Error) => {
  console.error("[UxBridge] Failed to load pages:", err.message);
  setState("ERROR");
  sendToUI({ type: "SYNC_ERROR", message: "Failed to load Figma pages: " + err.message });
});

// Handle messages from UI
onUIMessage((msg) => {
  if (msg.type === "WS_READY") {
    // WS reconnected — if we were showing "Not connected" error, reset to IDLE
    if (pluginState === "ERROR") {
      setState("IDLE");
      broadcastState();
    }
  } else if (msg.type === "CONNECT_PROJECT") {
    figma.root.setPluginData("projectId", msg.projectId);
    setState("IDLE");
    broadcastState();
  } else if (msg.type === "DISCONNECT_PROJECT") {
    figma.root.setPluginData("projectId", "");
    buffer.flush();
    triggerEngine.clearTimers();
    setState("NOT_CONNECTED");
    broadcastState();
  } else if (msg.type === "TRIGGER_MANUAL_SYNC") {
    triggerEngine.triggerManual();
  } else if (msg.type === "DISCARD_CHANGES") {
    buffer.flush(); // discard
    triggerEngine.clearTimers();
    setState("IDLE");
    broadcastState();
  } else if (msg.type === "REQUEST_STATE") {
    broadcastState();
  } else if (msg.type === "WS_RESPONSE") {
    if (msg.status === "error") {
      setState("ERROR");
      sendToUI({ type: "SYNC_ERROR", message: msg.errorMessage ?? "Unknown error" });
    } else {
      setState("COMPLETADO");
      sendToUI({
        type: "SYNC_COMPLETE",
        prUrl: msg.prUrl ?? "",
        prNumber: msg.prNumber ?? 0,
        branchName: msg.branchName ?? "",
      });
      setTimeout(() => { setState("IDLE"); broadcastState(); }, 5000);
    }
  }
});

figma.on("close", () => {
  triggerEngine.clearTimers();
});

function setState(state: PluginState): void {
  pluginState = state;
}

function broadcastState(): void {
  sendToUI({
    type: "STATE_UPDATE",
    state: pluginState,
    pendingCount: buffer.size,
    highCount: buffer.countBySignificance("HIGH"),
    summary: buffer.getSummary(),
    inactivityMs: triggerEngine.inactivityTimeRemaining,
    projectId: figma.root.getPluginData("projectId"),
  });
}
