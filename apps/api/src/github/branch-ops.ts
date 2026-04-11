import type { CreateDesignBranchParams } from "@uxbridge/types";

import { getInstallationOctokit } from "./github-app.js";

/** Create a branch and commit files to it in one operation */
export async function createDesignBranch(
  params: CreateDesignBranchParams,
): Promise<{ sha: string }> {
  const { repo, baseBranch, branchName, commitMessage, files } = params;
  const [owner, repoName] = repo.split("/") as [string, string];

  const octokit = await getInstallationOctokit(repo);

  // Get base branch SHA
  const { data: ref } = await octokit.git.getRef({
    owner,
    repo: repoName,
    ref: `heads/${baseBranch}`,
  });
  const baseSha = ref.object.sha;

  // Get base tree
  const { data: baseCommit } = await octokit.git.getCommit({
    owner,
    repo: repoName,
    commit_sha: baseSha,
  });

  // Create blobs for each file
  const treeItems = await Promise.all(
    files.map(async (file) => {
      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo: repoName,
        content: Buffer.from(file.content).toString("base64"),
        encoding: "base64",
      });
      return {
        path: file.path,
        mode: "100644" as const,
        type: "blob" as const,
        sha: blob.sha,
      };
    }),
  );

  // Create tree
  const { data: newTree } = await octokit.git.createTree({
    owner,
    repo: repoName,
    base_tree: baseCommit.tree.sha,
    tree: treeItems,
  });

  // Create commit
  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo: repoName,
    message: commitMessage,
    tree: newTree.sha,
    parents: [baseSha],
  });

  // Create branch pointing to new commit
  await octokit.git.createRef({
    owner,
    repo: repoName,
    ref: `refs/heads/${branchName}`,
    sha: newCommit.sha,
  });

  return { sha: newCommit.sha };
}
