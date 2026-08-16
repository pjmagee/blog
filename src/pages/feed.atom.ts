import type { APIContext } from "astro";
import { site, postHref } from "../data/site";
import { getPosts } from "../lib/content";

function escape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET(context: APIContext) {
  const origin = (context.site ?? site.url).toString().replace(/\/$/, "");
  const posts = (await getPosts()).slice(0, site.feedSize);
  const updated = (posts[0]?.data.published ?? new Date()).toISOString();

  const entries = posts
    .map((post) => {
      const href = `${origin}${postHref(post.id)}`;
      const summary = escape(post.data.lead ?? site.description);
      return `  <entry>
    <title>${escape(post.data.title)}</title>
    <link href="${href}" />
    <id>${href}</id>
    <updated>${post.data.published.toISOString()}</updated>
    <summary>${summary}</summary>
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escape(site.title)}</title>
  <subtitle>${escape(site.description)}</subtitle>
  <link href="${origin}/feed.atom" rel="self" />
  <link href="${origin}/" />
  <updated>${updated}</updated>
  <id>${origin}/</id>
  <author>
    <name>${escape(site.author)}</name>
  </author>
${entries}
</feed>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
}
