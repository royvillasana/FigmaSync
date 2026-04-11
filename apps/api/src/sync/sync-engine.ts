/**
 * Sync Engine — orchestrates the Figma → GitHub pipeline.
 * Called by the WebSocket server when a batch flush arrives.
 *
 * Phase 1 flow:
 *   1. Receive batch of changed nodes from plugin
 *   2. Fetch design context from Figma REST API
 *   3. Generate component code via OpenRouter AI
 *   4. Create GitHub branch + PR with generated files
 */

import type { BatchFlushPayload, SyncEventTrigger } from "@uxbridge/types";
import {
  createSyncEvent,
  getProjectById,
  getProjectByFigmaKey,
  updateSyncEventStatus,
} from "@uxbridge/db";

import { WS_EVENTS } from "../websocket/ws-events.js";
import { notifyPlugin } from "../websocket/ws-server.js";

import { createDesignPR } from "./branch-manager.js";
import { deduplicateChanges, filterSignificantChanges } from "./change-buffer.js";
import { getFigmaNodeContexts } from "./figma-context.js";
import { generateComponentCode, generateTokensFile } from "./code-generator.js";

export async function processBatchFlush(
  payload: BatchFlushPayload,
  projectId: string,
): Promise<void> {
  // Prefer lookup by projectId (WS-connected UUID); fall back to figmaFileKey for older clients
  const project = (projectId ? await getProjectById(projectId) : null)
    ?? (payload.figmaFileKey ? await getProjectByFigmaKey(payload.figmaFileKey) : null);
  if (!project) {
    throw new Error(`No project found for projectId=${projectId} figmaFileKey=${payload.figmaFileKey}`);
  }

  const batchId = crypto.randomUUID();
  const changes = deduplicateChanges(payload.changes);

  const high = changes.filter((c) => c.significance === "HIGH").length;
  const medium = changes.filter((c) => c.significance === "MEDIUM").length;
  const low = changes.filter((c) => c.significance === "LOW").length;
  console.log(`[SyncEngine] Changes: ${changes.length} total (HIGH=${high} MEDIUM=${medium} LOW=${low}) trigger=${payload.trigger}`);

  // Manual sync includes all changes; auto-sync only processes HIGH/MEDIUM
  const significantChanges = payload.trigger === "manual"
    ? changes
    : filterSignificantChanges(changes);

  if (significantChanges.length === 0) {
    console.log("[SyncEngine] No significant changes — skipping batch");
    return;
  }

  const trigger = mapTrigger(payload.trigger);
  const syncEvent = await createSyncEvent({
    project_id: project.id,
    mapping_id: null as unknown as string,
    direction: "figma_to_github",
    trigger,
    status: "staged",
    batch_id: batchId,
    batch_change_count: changes.length,
    branch_name: null,
    pr_number: null,
    figma_version_before: null,
    payload_hash: null,
    ai_model_used: null,
    duration_ms: null,
    error_message: null,
  });

  const startTime = Date.now();

  try {
    // Step 1 — Fetch Figma design context for each changed node
    const componentChanges = significantChanges.filter(
      (c) => c.nodeType === "COMPONENT" || c.nodeType === "COMPONENT_SET" || c.nodeType === "FRAME",
    );
    const tokenChanges = changes.filter((c) => c.nodeType === "VARIABLE");

    // Use the project's stored figma_file_key when the plugin sends an empty one
    const figmaFileKey = payload.figmaFileKey || project.figma_file_key;
    console.log(`[SyncEngine] Fetching Figma context for ${componentChanges.length} nodes (figmaFileKey=${figmaFileKey})`);

    const nodeIds = componentChanges.map((c) => c.nodeId);
    const contexts = nodeIds.length > 0 && figmaFileKey
      ? await getFigmaNodeContexts(figmaFileKey, nodeIds).catch((err) => {
          console.warn("[SyncEngine] Figma context fetch failed, using stubs:", err.message);
          return [];
        })
      : [];

    // Step 2 — Generate component code via AI
    const generatedFiles = await Promise.all(
      contexts.map((ctx) =>
        generateComponentCode(ctx).catch((err) => {
          console.warn(`[SyncEngine] Code gen failed for ${ctx.nodeName}:`, err.message);
          return {
            path: `src/components/ui/${ctx.nodeName.toLowerCase().replace(/\s+/g, "-")}.tsx`,
            content: `// TODO: generated from Figma node ${ctx.nodeId}\n// ${ctx.nodeName}\n`,
            nodeId: ctx.nodeId,
            modelUsed: "fallback",
          };
        }),
      ),
    );

    // Step 3 — Generate tokens file if any variable changes
    if (tokenChanges.length > 0) {
      const tokenEntries = tokenChanges.map((c) => ({ name: c.nodeName, value: c.changedProperties }));
      const tokensFile = await generateTokensFile(tokenEntries).catch(() => ({
        path: "tokens/tokens.json",
        content: `// TODO: updated by DTCG extractor\n`,
        nodeId: "tokens",
        modelUsed: "fallback",
      }));
      generatedFiles.push(tokensFile);
    }

    // Fallback — if no contexts were fetched, use stubs so the PR still gets created
    const files = generatedFiles.length > 0
      ? generatedFiles.map((f) => ({ path: f.path, content: f.content }))
      : significantChanges.map((c) => ({
          path: `src/components/ui/${c.nodeName.toLowerCase().replace(/\s+/g, "-")}.tsx`,
          content: `// TODO: generated from Figma node ${c.nodeId}\n// ${c.nodeName} — ${c.changedProperties.join(", ")}\n`,
        }));

    const modelsUsed = [...new Set(generatedFiles.map((f) => f.modelUsed))].join(", ");

    // Step 4 — Create GitHub branch + PR
    const { prNumber, prUrl, branchName } = await createDesignPR(payload, project, files);

    const duration = Date.now() - startTime;
    await updateSyncEventStatus(syncEvent.id, "success", {
      branch_name: branchName,
      pr_number: prNumber,
      duration_ms: duration,
      ai_model_used: modelsUsed || null,
    });

    notifyPlugin(projectId, {
      type: WS_EVENTS.PR_CREATED,
      payload: {
        batchId,
        prNumber,
        prUrl,
        branchName,
        changeCount: changes.length,
        status: "pr_created",
        errorMessage: null,
      },
      timestamp: Date.now(),
      messageId: crypto.randomUUID(),
    });

    console.log(`[SyncEngine] Batch ${batchId} → PR #${prNumber} (${files.length} files, models: ${modelsUsed})`);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    await updateSyncEventStatus(syncEvent.id, "error", {
      duration_ms: Date.now() - startTime,
      error_message: error.message,
    });
    throw error;
  }
}

function mapTrigger(t: BatchFlushPayload["trigger"]): SyncEventTrigger {
  const map: Record<string, SyncEventTrigger> = {
    auto_inactivity: "plugin_auto_inactivity",
    auto_threshold: "plugin_auto_threshold",
    manual: "plugin_manual",
    auto_timeout: "plugin_auto_timeout",
  };
  return map[t] ?? "plugin_manual";
}
