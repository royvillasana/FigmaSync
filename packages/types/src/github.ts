// =============================================================================
// GitHub App / webhook types
// =============================================================================

export type GitHubEventType =
  | "push"
  | "pull_request"
  | "pull_request_review"
  | "installation"
  | "installation_repositories";

export interface GitHubWebhookPushPayload {
  ref: string;
  before: string;
  after: string;
  repository: {
    id: number;
    full_name: string;
    default_branch: string;
  };
  commits: Array<{
    id: string;
    message: string;
    added: string[];
    removed: string[];
    modified: string[];
  }>;
  installation?: { id: number };
}

export interface GitHubWebhookPullRequestPayload {
  action: "opened" | "closed" | "merged" | "synchronize" | "reopened";
  number: number;
  pull_request: {
    id: number;
    number: number;
    title: string;
    body: string | null;
    state: "open" | "closed";
    merged: boolean;
    merged_at: string | null;
    head: { ref: string; sha: string };
    base: { ref: string; sha: string };
    html_url: string;
  };
  repository: { full_name: string };
  installation?: { id: number };
}

/** Params for creating a branch + PR from a batch flush */
export interface CreateDesignBranchParams {
  repo: string;
  baseBranch: string;
  branchName: string;
  commitMessage: string;
  files: Array<{ path: string; content: string }>;
  prTitle: string;
  prBody: string;
}

export interface CreatedPR {
  number: number;
  url: string;
  branchName: string;
  sha: string;
}
