/**
 * Batch Trigger Engine
 * Manages the 4 triggers (A, B, C, D) that decide when to flush the buffer.
 *
 * A — Inactivity:    No changes for inactivity_timeout_ms, buffer has ≥1 MEDIUM/HIGH
 * B — Threshold:     Buffer has ≥ auto_sync_threshold HIGH changes → flush immediately
 * C — Manual:        User presses "Sync ahora" → flush regardless
 * D — Max timeout:   Buffer age ≥ max_wait_timeout_ms → forced flush
 */

import type { BatchConfig, BatchTrigger } from "@uxbridge/types";
import { DEFAULT_BATCH_CONFIG } from "@uxbridge/types";

import type { ChangeBuffer } from "./change-buffer.js";

export type TriggerCallback = (trigger: BatchTrigger) => void;

export class BatchTriggerEngine {
  private config: BatchConfig;
  private buffer: ChangeBuffer;
  private onTrigger: TriggerCallback;

  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private maxTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private lastActivityAt = 0;

  constructor(buffer: ChangeBuffer, onTrigger: TriggerCallback, config: Partial<BatchConfig> = {}) {
    this.config = { ...DEFAULT_BATCH_CONFIG, ...config };
    this.buffer = buffer;
    this.onTrigger = onTrigger;
  }

  /** Call this every time a change is added to the buffer */
  onChangeAdded(): void {
    if (this.config.syncMode === "manual_only") return;

    this.lastActivityAt = Date.now();

    // Trigger B: immediate flush if threshold reached
    const highCount = this.buffer.countBySignificance("HIGH");
    if (highCount >= this.config.autoSyncThreshold) {
      this.clearTimers();
      this.fire("auto_threshold");
      return;
    }

    // Restart inactivity timer (Trigger A)
    this.resetInactivityTimer();

    // Start max-timeout timer (Trigger D) if not already running
    if (!this.maxTimeoutTimer) {
      this.maxTimeoutTimer = setTimeout(() => {
        this.clearTimers();
        if (!this.buffer.isEmpty) {
          this.fire("auto_timeout");
        }
      }, this.config.maxWaitTimeoutMs);
    }
  }

  /** Trigger C — manual flush (always available, any state) */
  triggerManual(): void {
    this.clearTimers();
    this.fire("manual");
  }

  /** Stop all timers (call on plugin close or after flush) */
  clearTimers(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    if (this.maxTimeoutTimer) {
      clearTimeout(this.maxTimeoutTimer);
      this.maxTimeoutTimer = null;
    }
  }

  /** Milliseconds until the inactivity timer fires (for countdown UI) */
  get inactivityTimeRemaining(): number {
    if (!this.inactivityTimer || this.lastActivityAt === 0) return 0;
    const elapsed = Date.now() - this.lastActivityAt;
    return Math.max(0, this.config.inactivityTimeoutMs - elapsed);
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);

    this.inactivityTimer = setTimeout(() => {
      this.inactivityTimer = null;
      const hasSignificantChanges =
        this.buffer.countBySignificance("HIGH") > 0 ||
        this.buffer.countBySignificance("MEDIUM") > 0;
      if (hasSignificantChanges && this.buffer.size >= this.config.minChangesForSync) {
        this.clearTimers();
        this.fire("auto_inactivity");
      }
    }, this.config.inactivityTimeoutMs);
  }

  private fire(trigger: BatchTrigger): void {
    if (this.buffer.isEmpty) return;
    this.onTrigger(trigger);
  }
}
