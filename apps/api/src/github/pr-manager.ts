import type { CreatedPR } from "@uxbridge/types";

import { getInstallationOctokit } from "./github-app.js";

interface CreatePRParams {
  repo: string;
  head: string;
  base: string;
  title: string;
  body: string;
  draft?: boolean;
}

export async function createPR(params: CreatePRParams): Promise<CreatedPR> {
  const [owner, repoName] = params.repo.split("/") as [string, string];
  const octokit = await getInstallationOctokit(params.repo);

  const { data: pr } = await octokit.pulls.create({
    owner,
    repo: repoName,
    title: params.title,
    body: params.body,
    head: params.head,
    base: params.base,
    draft: params.draft ?? false,
  });

  return {
    number: pr.number,
    url: pr.html_url,
    branchName: params.head,
    sha: pr.head.sha,
  };
}

export async function addPRComment(repo: string, prNumber: number, body: string): Promise<void> {
  const [owner, repoName] = repo.split("/") as [string, string];
  const octokit = await getInstallationOctokit(repo);
  await octokit.issues.createComment({ owner, repo: repoName, issue_number: prNumber, body });
}
