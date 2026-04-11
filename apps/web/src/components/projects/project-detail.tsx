"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  figma_file_key: string;
  github_repo: string;
  sync_on_merge_to: string;
  pr_target_branch: string;
  design_branch_prefix: string;
  design_system_via: string;
  is_active: boolean;
  created_at: string;
}

export function ProjectDetail({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    figma_file_url: "",
    github_repo: "",
    sync_on_merge_to: "",
    pr_target_branch: "",
    design_branch_prefix: "",
  });

  useEffect(() => {
    fetch(`http://localhost:3001/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data);
        setForm({
          figma_file_url: `https://www.figma.com/file/${data.figma_file_key ?? ""}`,
          github_repo: data.github_repo ?? "",
          sync_on_merge_to: data.sync_on_merge_to ?? "",
          pr_target_branch: data.pr_target_branch ?? "",
          design_branch_prefix: data.design_branch_prefix ?? "",
        });
      })
      .catch(() => setError("Failed to load project"))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setProject(data);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete");
      }
      router.push("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setDeleting(false);
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!project) return <div className="text-sm text-red-600">{error ?? "Project not found"}</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.github_repo}</h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">{project.id}</p>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="border rounded-md px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="border border-red-200 text-red-600 rounded-md px-3 py-1.5 text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {editing ? (
        <div className="space-y-4 border rounded-lg p-4">
          <p className="text-sm font-medium">Edit project</p>
          <div className="space-y-3">
            {[
              { label: "Figma File URL", key: "figma_file_url", placeholder: "https://www.figma.com/file/..." },
              { label: "GitHub Repository", key: "github_repo", placeholder: "owner/repo" },
              { label: "Sync branch", key: "sync_on_merge_to", placeholder: "main" },
              { label: "PR target branch", key: "pr_target_branch", placeholder: "main" },
              { label: "Design branch prefix", key: "design_branch_prefix", placeholder: "design/" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key as keyof typeof form]}
                  placeholder={placeholder}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setEditing(false); setError(null); }}
              disabled={saving}
              className="flex-1 border rounded-md px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {[
            { label: "Figma file key", value: project.figma_file_key },
            { label: "GitHub repo", value: project.github_repo },
            { label: "Sync on merge to", value: project.sync_on_merge_to },
            { label: "PR target branch", value: project.pr_target_branch },
            { label: "Design branch prefix", value: project.design_branch_prefix },
            { label: "Design system via", value: `Via ${project.design_system_via}` },
            { label: "Status", value: project.is_active ? "Active" : "Inactive" },
            { label: "Created", value: new Date(project.created_at).toLocaleDateString() },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-sm font-mono">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
