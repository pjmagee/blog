# Patrick's Blog

Published at [https://blog.ghp.magaoidh.pro/](https://blog.ghp.magaoidh.pro/) via GitHub Pages (`pjmagee/pjmagee.github.io`).

Static site built with [Astro](https://astro.build).

## Local development

```bash
npm install
npm run dev
```

Preview a production build:

```bash
npm run build
npm run preview
```

## Content

- Posts live in `src/content/posts/`
- About and Recommended pages live in `src/content/pages/`
- Site metadata is in `src/data/site.ts`

Post front matter:

```yaml
---
title: Post title
lead: Optional subtitle
published: 2026-01-01
tags:
  - Example
---
```

The filename (without `.md`) is the public slug, for example `2024-06-04-portable-cicd-with-dagger.md` → `/posts/2024-06-04-portable-cicd-with-dagger`.

## Deploy

Pushes to `main` build the site and publish the `dist/` output to the `gh-pages` branch. GitHub Pages serves that branch at `blog.ghp.magaoidh.pro`.
