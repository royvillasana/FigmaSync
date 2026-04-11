import Link from "next/link";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview" },
  { href: "/projects", label: "Projects" },
  { href: "/tokens", label: "Tokens" },
];

export function Sidebar() {
  return (
    <aside className="w-56 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <span className="font-bold text-lg">UxBridge</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
