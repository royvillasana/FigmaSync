import Link from "next/link";

async function getProjects() {
  try {
    const res = await fetch("http://localhost:3001/api/projects", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Figma file ↔ GitHub repo pairs
          </p>
        </div>
        <Link
          href="/projects/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-muted-foreground text-sm">
          No projects yet. Connect a Figma file and GitHub repo to get started.
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((project: { id: string; figma_file_key: string; github_repo: string; sync_on_merge_to: string; design_system_via: string; is_active: boolean }) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block border rounded-lg p-4 hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{project.github_repo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Figma key: {project.figma_file_key}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Via {project.design_system_via}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${project.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {project.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Syncs on merge to <span className="font-mono">{project.sync_on_merge_to}</span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
