import type { Request, Response } from "express";
import { Router } from "express";
import crypto from "crypto";

import type { GitHubWebhookPullRequestPayload, GitHubWebhookPushPayload } from "@uxbridge/types";

import { env } from "../config/env.js";
import { handlePullRequestEvent, handlePushEvent } from "../github/webhook-handler.js";

export const webhooksRouter = Router();

function verifyGitHubSignature(req: Request): boolean {
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  if (!signature) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", env.GITHUB_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex")}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

webhooksRouter.post("/github", async (req: Request, res: Response) => {
  if (!verifyGitHubSignature(req)) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const event = req.headers["x-github-event"] as string;

  try {
    if (event === "push") {
      await handlePushEvent(req.body as GitHubWebhookPushPayload);
    } else if (event === "pull_request") {
      await handlePullRequestEvent(req.body as GitHubWebhookPullRequestPayload);
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[Webhook] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});
