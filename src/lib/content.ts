import { getCollection, type CollectionEntry } from "astro:content";
import { site, slugifyTag } from "../data/site";

export type Post = CollectionEntry<"posts">;

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("posts");
  return posts.sort(
    (a, b) => b.data.published.getTime() - a.data.published.getTime(),
  );
}

export function paginate<T>(items: T[], page: number, pageSize = site.pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    totalPages,
    hasNewer: page > 1,
    hasOlder: page < totalPages,
    newerHref: page === 2 ? "/" : page > 2 ? `/page/${page - 1}` : undefined,
    olderHref: page < totalPages ? `/page/${page + 1}` : undefined,
  };
}

export function tagsFrom(posts: Post[]) {
  const counts = new Map<string, { tag: string; count: number }>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const key = slugifyTag(tag);
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { tag, count: 1 });
    }
  }
  return [...counts.entries()]
    .map(([slug, value]) => ({ slug, ...value }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function postsForTag(posts: Post[], slug: string) {
  return posts.filter((post) =>
    post.data.tags.some((tag) => slugifyTag(tag) === slug),
  );
}
