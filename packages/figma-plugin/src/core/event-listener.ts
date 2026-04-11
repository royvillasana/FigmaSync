/**
 * Figma documentChange event listener
 * Bridges the Figma Plugin API event system to the ChangeBuffer + BatchTriggerEngine.
 */

import type { ChangeNodeType, ChangeType } from "@uxbridge/types";

import { BatchTriggerEngine } from "./batch-trigger.js";
import { ChangeBuffer } from "./change-buffer.js";
import { classifyChange } from "./change-classifier.js";

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
export function registerDocumentChangeListener(deps: EventListenerDeps): () => void {
  const { buffer, triggerEngine, onStateChange } = deps;

  const handler = (event: DocumentChangeEvent) => {
    for (const change of event.documentChanges) {
      const currentPageName = figma.currentPage.name;

      // Cast to expected shape
      type RawNode = { type: string; name: string; parent?: { name: string } };
      const rawNode = (change as { node?: RawNode }).node;
      const parentNode = rawNode?.parent;
      const properties = (change as { properties?: string[] }).properties;
      const rawChange = {
        type: change.type,
        node: {
          type: rawNode?.type ?? "",
          name: rawNode?.name ?? "",
          ...(parentNode ? { parent: parentNode } : {}),
        },
        ...(properties !== undefined ? { properties } : {}),
      };

      const classified = classifyChange(rawChange, currentPageName);

      console.log(`[UxBridge] change: type=${rawChange.type} nodeType=${rawChange.node.type} name="${rawChange.node.name}" props=${JSON.stringify(rawChange.properties)} → ${classified.significance}`);

      if (classified.significance === "IGNORE") continue;

      buffer.add({
        nodeId: (change as { id?: string }).id ?? rawChange.node.name,
        nodeName: rawChange.node.name,
        nodeType: (rawChange.node.type as ChangeNodeType) ?? "FRAME",
        changeType: classified.changeType as ChangeType,
        changedProperties: rawChange.properties ?? [],
        significance: classified.significance,
        isInDSPage: classified.isInDSPage,
      });

      triggerEngine.onChangeAdded();
      onStateChange("change_added");
    }
  };

  figma.on("documentchange", handler);

  return () => {
    figma.off("documentchange", handler);
  };
}
