import type { SyncEvent } from "@uxbridge/types";

import { supabaseAdmin } from "../client.js";

const TABLE = "sync_events" as const;

export async function createSyncEvent(
  event: Omit<SyncEvent, "id" | "created_at">,
): Promise<SyncEvent> {
  const { data, error } = await supabaseAdmin.from(TABLE).insert(event).select().single();
  if (error) throw error;
  return data as SyncEvent;
}

export async function getSyncEventsByProject(
  projectId: string,
  limit = 50,
): Promise<SyncEvent[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as SyncEvent[];
}

export async function updateSyncEventStatus(
  id: string,
  status: SyncEvent["status"],
  extra?: Partial<SyncEvent>,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .update({ status, ...extra })
    .eq("id", id);
  if (error) throw error;
}
