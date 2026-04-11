/**
 * Change Buffer
 * Map<nodeId, PendingChange> — deduplicates edits to the same node.
 * 40 edits to the same node = 1 PendingChange (state after last edit).
 */

import type { BatchConfig, ChangeType, PendingChange } from "@uxbridge/types";
import { DEFAULT_BATCH_CONFIG } from "@uxbridge/types";

export class ChangeBuffer {
  private buffer: Map<string, PendingChange> = new Map();
  private config: BatchConfig;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = { ...DEFAULT_BATCH_CONFIG, ...config };
  }

  /**
   * Add or merge a change into the buffer.
   * If the node already has a pending change, merges changedProperties
   * and updates lastSeenAt.
   */
  add(change: Omit<PendingChange, "firstSeenAt" | "lastSeenAt">): void {
    const now = Date.now();
    const existing = this.buffer.get(change.nodeId);

    if (existing) {
      // Merge: union of changedProperties, update lastSeenAt
      existing.changedProperties = [
        ...new Set([...existing.changedProperties, ...change.changedProperties]),
      ];
      existing.lastSeenAt = now;
      // Upgrade significance if the new change is more important
      if (this.significanceRank(change.significance) > this.significanceRank(existing.significance)) {
        existing.significance = change.significance;
      }
      // Upgrade change type: DELETE > CREATE > PROPERTY_CHANGE
      if (this.changeTypeRank(change.changeType) > this.changeTypeRank(existing.changeType)) {
        existing.changeType = change.changeType;
      }
    } else {
      this.buffer.set(change.nodeId, {
        ...change,
        firstSeenAt: now,
        lastSeenAt: now,
      });
    }
  }

  /** Flush: return all pending changes and clear the buffer */
  flush(): PendingChange[] {
    if (this.config.ignoreLowSignificance) {
      const changes = Array.from(this.buffer.values()).filter(
        (c) => c.significance !== "LOW",
      );
      this.buffer.clear();
      return changes;
    }
    const changes = Array.from(this.buffer.values());
    this.buffer.clear();
    return changes;
  }

  /** Count changes by significance */
  countBySignificance(significance: PendingChange["significance"]): number {
    return Array.from(this.buffer.values()).filter(
      (c) => c.significance === significance,
    ).length;
  }

  /** Total changes in buffer */
  get size(): number {
    return this.buffer.size;
  }

  /** Is the buffer empty? */
  get isEmpty(): boolean {
    return this.buffer.size === 0;
  }

  /** Age of oldest change in buffer (ms) */
  get oldestChangeAge(): number {
    let oldest = Infinity;
    for (const c of this.buffer.values()) {
      if (c.firstSeenAt < oldest) oldest = c.firstSeenAt;
    }
    return oldest === Infinity ? 0 : Date.now() - oldest;
  }

  /** Get a summary list for the UI */
  getSummary(): Array<{ name: string; significance: PendingChange["significance"]; properties: string[] }> {
    return Array.from(this.buffer.values()).map((c) => ({
      name: c.nodeName,
      significance: c.significance,
      properties: c.changedProperties,
    }));
  }

  private significanceRank(s: PendingChange["significance"]): number {
    return { HIGH: 3, MEDIUM: 2, LOW: 1, IGNORE: 0 }[s] ?? 0;
  }

  private changeTypeRank(t: ChangeType): number {
    return { DELETE: 3, CREATE: 2, PROPERTY_CHANGE: 1 }[t] ?? 0;
  }
}
