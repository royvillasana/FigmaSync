/**
 * Figma documentChange event listener
 * Bridges the Figma Plugin API event system to the ChangeBuffer + BatchTriggerEngine.
 */
import { BatchTriggerEngine } from "./batch-trigger.js";
import { ChangeBuffer } from "./change-buffer.js";
export interface EventListenerDeps {
    buffer: ChangeBuffer;
    triggerEngine: BatchTriggerEngine;
    /** Called when plugin state should change (for UI updates) */
    onStateChange: (event: "change_added" | "flush_started") => void;
}
/**
 * Register the documentChange listener on the Figma plugin API.
 * Returns a cleanup function to deregister.
 */
export declare function registerDocumentChangeListener(deps: EventListenerDeps): () => void;
//# sourceMappingURL=event-listener.d.ts.map