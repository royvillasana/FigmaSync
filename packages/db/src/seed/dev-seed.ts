/**
 * Dev seed — creates a sample workspace, project, and component mapping
 * Run: pnpm --filter @uxbridge/db seed
 */
import { supabaseAdmin } from "../client.js";

async function seed() {
  console.log("🌱 Seeding dev database...");

  const { data: workspace, error: wsError } = await supabaseAdmin
    .from("workspaces")
    .insert({ name: "Acme Corp", plan: "pro", ai_model_default: "google/gemini-2.5-pro" })
    .select()
    .single();

  if (wsError) throw wsError;
  console.log("✓ Workspace created:", workspace.id);

  const { data: project, error: projError } = await supabaseAdmin
    .from("projects")
    .insert({
      workspace_id: workspace.id,
      figma_file_key: "abc123XYZ",
      github_repo: "acme/design-system",
      design_system_via: "A",
      ds_system: "shadcn",
    })
    .select()
    .single();

  if (projError) throw projError;
  console.log("✓ Project created:", project.id);

  const { data: mapping, error: mapError } = await supabaseAdmin
    .from("component_mappings")
    .insert({
      workspace_id: workspace.id,
      project_id: project.id,
      figma_file_key: "abc123XYZ",
      figma_node_id: "142:8",
      figma_node_name: "Button",
      figma_node_type: "COMPONENT_SET",
      code_repo: "acme/design-system",
      code_file_path: "src/components/ui/button.tsx",
      code_component_name: "Button",
      code_export_type: "named",
      framework_label: "React",
      ds_source: "predefined",
      ds_system: "shadcn",
      sync_direction: "bidirectional",
      created_by: "user",
    })
    .select()
    .single();

  if (mapError) throw mapError;
  console.log("✓ ComponentMapping created:", mapping.id);

  console.log("✅ Dev seed complete");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
