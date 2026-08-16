import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { site, postHref } from "../data/site";
import { getPosts } from "../lib/content";

export async function GET(context: APIContext) {
  const posts = (await getPosts()).slice(0, site.feedSize);
  return rss({
    title: site.title,
    description: site.description,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.lead ?? site.description,
      pubDate: post.data.published,
      link: postHref(post.id),
    })),
  });
}
