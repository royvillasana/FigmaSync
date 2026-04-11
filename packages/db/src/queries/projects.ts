import type { Project } from "@uxbridge/types";

import { supabaseAdmin } from "../client.js";

const TABLE = "projects" as const;

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).single();
  if (error && error.code !== "PGRST116") throw error;
  return (data as Project | null) ?? null;
}

export async function getProjectByFigmaKey(figmaFileKey: string): Promise<Project | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("figma_file_key", figmaFileKey)
    .eq("is_active", true)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return (data as Project | null) ?? null;
}

export async function getProjectByRepo(githubRepo: string): Promise<Project | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("github_repo", githubRepo)
    .eq("is_active", true)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return (data as Project | null) ?? null;
}

export async function createProject(
  project: Omit<Project, "id" | "created_at">,
): Promise<Project> {
  const { data, error } = await supabaseAdmin.from(TABLE).insert(project).select().single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const { error } = await supabaseAdmin.from(TABLE).update(updates).eq("id", id);
  if (error) throw error;
}
