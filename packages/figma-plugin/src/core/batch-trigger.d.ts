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
import type { ChangeBuffer } from "./change-buffer.js";
export type TriggerCallback = (trigger: BatchTrigger) => void;
export declare class BatchTriggerEngine {
    private config;
    private buffer;
    private onTrigger;
    private inactivityTimer;
    private maxTimeoutTimer;
    private lastActivityAt;
    constructor(buffer: ChangeBuffer, onTrigger: TriggerCallback, config?: Partial<BatchConfig>);
    /** Call this every time a change is added to the buffer */
    onChangeAdded(): void;
    /** Trigger C — manual flush (always available, any state) */
    triggerManual(): void;
    /** Stop all timers (call on plugin close or after flush) */
    clearTimers(): void;
    /** Milliseconds until the inactivity timer fires (for countdown UI) */
    get inactivityTimeRemaining(): number;
    private resetInactivityTimer;
    private fire;
}
//# sourceMappingURL=batch-trigger.d.ts.map