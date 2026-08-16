import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    lead: z.string().optional(),
    published: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    canonical: z.string().url().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    lead: z.string().optional(),
    published: z.coerce.date().optional(),
  }),
});

export const collections = { posts, pages };
