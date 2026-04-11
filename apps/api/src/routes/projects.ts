import type { Request, Response } from "express";
import { Router } from "express";

import { supabaseAdmin, getAllProjects, createProject, getProjectById, updateProject, getMappingsByProject, getSyncEventsByProject } from "@uxbridge/db";

export const projectsRouter = Router();

async function getOrCreateDefaultWorkspace(): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("workspaces")
    .select("id")
    .eq("name", "Default")
    .single();

  if (data) return data.id as string;
  if (error && error.code !== "PGRST116") throw error;

  const { data: created, error: createError } = await supabaseAdmin
    .from("workspaces")
    .insert({ name: "Default", plan: "free" })
    .select("id")
    .single();

  if (createError) throw createError;
  return created.id as string;
}

projectsRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const projects = await getAllProjects();
    res.json(projects);
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    res.status(500).json({ error: message });
  }
});

projectsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { figma_file_url, github_repo, sync_on_merge_to, via } = req.body as {
      figma_file_url: string;
      github_repo: string;
      sync_on_merge_to: string;
      via: string;
    };

    if (!figma_file_url || !github_repo || !sync_on_merge_to) {
      res.status(400).json({ error: "figma_file_url, github_repo, and sync_on_merge_to are required" });
      return;
    }

    const figmaFileKeyMatch = figma_file_url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
    if (!figmaFileKeyMatch) {
      res.status(400).json({ error: "Invalid Figma URL — expected figma.com/file/<key> or figma.com/design/<key>" });
      return;
    }
    const figma_file_key = figmaFileKeyMatch[1]!;

    const workspace_id = await getOrCreateDefaultWorkspace();

    const project = await createProject({
      figma_file_key,
      github_repo,
      sync_on_merge_to,
      design_system_via: (via as "A" | "B" | "C" | "D") ?? "A",
      workspace_id,
      is_active: true,
      design_branch_prefix: "design/",
      pr_target_branch: sync_on_merge_to,
    });

    res.status(201).json(project);
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[Projects] POST error:", message);
    res.status(500).json({ error: message });
  }
});

projectsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const project = await getProjectById(req.params["id"] ?? "");
    if (!project) { res.status(404).json({ error: "Not found" }); return; }
    res.json(project);
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    res.status(500).json({ error: message });
  }
});

projectsRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] ?? "";
    const { figma_file_url, github_repo, sync_on_merge_to, pr_target_branch, design_branch_prefix, is_active } = req.body as {
      figma_file_url?: string;
      github_repo?: string;
      sync_on_merge_to?: string;
      pr_target_branch?: string;
      design_branch_prefix?: string;
      is_active?: boolean;
    };

    const updates: Record<string, unknown> = { github_repo, sync_on_merge_to, pr_target_branch, design_branch_prefix, is_active };

    if (figma_file_url) {
      const match = figma_file_url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
      if (!match) {
        res.status(400).json({ error: "Invalid Figma URL — expected figma.com/file/<key> or figma.com/design/<key>" });
        return;
      }
      updates.figma_file_key = match[1];
    }

    // Remove undefined values
    for (const key of Object.keys(updates)) {
      if (updates[key] === undefined) delete updates[key];
    }

    await updateProject(id, updates);
    const updated = await getProjectById(id);
    res.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    res.status(500).json({ error: message });
  }
});

projectsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] ?? "";
    const { error } = await supabaseAdmin.from("projects").delete().eq("id", id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    res.status(500).json({ error: message });
  }
});

projectsRouter.get("/:id/mappings", async (req: Request, res: Response) => {
  try {
    const mappings = await getMappingsByProject(req.params["id"] ?? "");
    res.json(mappings);
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    res.status(500).json({ error: message });
  }
});

projectsRouter.get("/:id/sync-history", async (req: Request, res: Response) => {
  try {
    const events = await getSyncEventsByProject(req.params["id"] ?? "");
    res.json(events);
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    res.status(500).json({ error: message });
  }
});
