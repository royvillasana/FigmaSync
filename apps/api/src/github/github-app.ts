import { App } from "@octokit/app";
import { Octokit } from "@octokit/rest";

import { env } from "../config/env.js";

let appInstance: App | null = null;

export function getGitHubApp(): App {
  if (!appInstance) {
    appInstance = new App({
      appId: env.GITHUB_APP_ID,
      privateKey: env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n"),
      webhooks: { secret: env.GITHUB_WEBHOOK_SECRET },
    });
  }
  return appInstance;
}

/** Get an installation-scoped Octokit for a given repo (owner/repo) */
export async function getInstallationOctokit(repo: string): Promise<Octokit> {
  const [owner, repoName] = repo.split("/") as [string, string | undefined];
  if (!owner || !repoName) throw new Error(`Invalid repo format: ${repo}`);

  const app = getGitHubApp();

  // Use the app-level JWT client to look up the installation for this repo
  const { data: installation } = await app.octokit.request(
    "GET /repos/{owner}/{repo}/installation",
    { owner, repo: repoName },
  );

  return app.getInstallationOctokit(installation.id) as unknown as Octokit;
}
