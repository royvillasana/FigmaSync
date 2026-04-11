import type { ComponentMapping, SyncStatus } from "@uxbridge/types";

import { supabaseAdmin } from "../client.js";

const TABLE = "component_mappings" as const;

export async function getMappingById(id: string): Promise<ComponentMapping | null> {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).single();
  if (error) throw error;
  return data as ComponentMapping | null;
}

export async function getMappingsByProject(projectId: string): Promise<ComponentMapping[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ComponentMapping[];
}

export async function getMappingByFigmaNode(
  figmaFileKey: string,
  figmaNodeId: string,
): Promise<ComponentMapping | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("figma_file_key", figmaFileKey)
    .eq("figma_node_id", figmaNodeId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return (data as ComponentMapping | null) ?? null;
}

export async function upsertMapping(
  mapping: Partial<ComponentMapping> & {
    figma_file_key: string;
    figma_node_id: string;
    project_id: string;
    workspace_id: string;
  },
): Promise<ComponentMapping> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .upsert(mapping, { onConflict: "figma_file_key,figma_node_id" })
    .select()
    .single();
  if (error) throw error;
  return data as ComponentMapping;
}

export async function updateMappingStatus(
  id: string,
  status: SyncStatus,
  extra?: Partial<ComponentMapping>,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .update({ sync_status: status, ...extra })
    .eq("id", id);
  if (error) throw error;
}

export async function getMappingsByBatchId(batchId: string): Promise<ComponentMapping[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("batch_id", batchId);
  if (error) throw error;
  return (data ?? []) as ComponentMapping[];
}
