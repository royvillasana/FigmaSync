/**
 * GitHub webhook handler
 * Processes push and pull_request events from the GitHub App.
 * The key trigger: a merge to sync_on_merge_to → update Figma.
 */

import type { GitHubWebhookPullRequestPayload, GitHubWebhookPushPayload } from "@uxbridge/types";
import { getProjectByRepo } from "@uxbridge/db";

export async function handlePushEvent(payload: GitHubWebhookPushPayload): Promise<void> {
  const repo = payload.repository.full_name;
  const project = await getProjectByRepo(repo);
  if (!project) return;

  const branchName = payload.ref.replace("refs/heads/", "");
  console.log(`[Webhook] Push to ${repo}/${branchName}`);

  // Only act on pushes to sync_on_merge_to branch
  if (branchName !== project.sync_on_merge_to) {
    console.log(`[Webhook] Branch ${branchName} is not sync branch — no Figma update`);
    return;
  }

  // Check if any relevant files changed (tokens.json, components)
  const changedFiles = payload.commits.flatMap((c) => [
    ...c.added,
    ...c.modified,
  ]);

  const hasTokenChanges = changedFiles.some((f) => f.includes("tokens.json"));
  const hasComponentChanges = changedFiles.some(
    (f) => f.endsWith(".tsx") || f.endsWith(".ts"),
  );

  if (!hasTokenChanges && !hasComponentChanges) return;

  console.log(`[Webhook] Sync-triggering push detected on ${branchName}`);
  // TODO Phase 2: queue GitHub → Figma sync job
}

export async function handlePullRequestEvent(
  payload: GitHubWebhookPullRequestPayload,
): Promise<void> {
  const repo = payload.repository.full_name;
  const project = await getProjectByRepo(repo);
  if (!project) return;

  const pr = payload.pull_request;

  if (payload.action === "closed" && pr.merged) {
    console.log(`[Webhook] PR #${pr.number} merged into ${pr.base.ref}`);
    if (pr.base.ref === project.sync_on_merge_to) {
      // TODO Phase 2: trigger Figma update, promote staging
      console.log(`[Webhook] Triggering Figma update for PR #${pr.number}`);
    }
  }

  if (payload.action === "opened" && pr.base.ref === project.sync_on_merge_to) {
    // TODO Phase 2: create Figma staging section
    console.log(`[Webhook] New PR #${pr.number} against sync branch — staging TODO`);
  }
}
