import { getCollection } from "astro:content";

export type SidebarKey = "home" | "posts";

export type SidebarPost = {
  label: string;
  href: string;
  slug: string;
};

export type SidebarGroup = {
  label: string;
  posts: SidebarPost[];
};

export type SidebarItem = {
  key: SidebarKey;
  label: string;
  href: string;
  count?: number;
  groups?: SidebarGroup[];
};

export async function buildSidebarItems(): Promise<SidebarItem[]> {
  const all = (await getCollection("posts")).filter((p) => !p.data.draft);

  // Group by platform, fallback to "other"
  const map = new Map<string, SidebarPost[]>();
  for (const p of all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())) {
    const key = p.data.platform ?? "other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({
      label: p.data.title,
      href: `/posts/${p.slug}`,
      slug: p.slug,
    });
  }

  const groups: SidebarGroup[] = [...map.entries()].map(([label, posts]) => ({
    label,
    posts,
  }));

  return [
    { key: "home", label: "home", href: "/home" },
    {
      key: "posts",
      label: "posts",
      href: "/posts",
      count: all.length,
      groups,
    },
  ];
}

export function activeKeyFromPath(pathname: string): SidebarKey {
  if (pathname === "/" || pathname.startsWith("/home")) return "home";
  if (pathname.startsWith("/posts")) return "posts";
  return "posts";
}
