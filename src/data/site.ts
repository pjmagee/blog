export const site = {
  title: "Patrick's Blog",
  description:
    "Notes on software, homelabs, and building things — from Patrick Magee.",
  author: "Patrick Magee",
  url: "https://blog.ghp.magaoidh.pro",
  portfolio: "https://magaoidh.pro",
  github: "pjmagee",
  twitter: "PatrickMagee",
  stackOverflow: "users/935280/patrick-magee",
  linkedIn: "patrickmageez",
  email: "patrick.magee@outlook.com",
  disqus: "pjmagee-github-io",
  ga: "UA-51533669-1",
  pageSize: 3,
  feedSize: 10,
  nav: [
    { href: "https://magaoidh.pro", label: "Portfolio", external: true },
    { href: "https://www.linkedin.com/in/patrickmageez/", label: "LinkedIn", external: true },
    { href: "/about", label: "About" },
    { href: "/posts", label: "Posts" },
    { href: "/tags", label: "Tags" },
  ],
} as const;

export function pageTitle(title?: string) {
  if (!title || title === site.title) return site.title;
  return `${site.title} - ${title}`;
}

export function slugifyTag(tag: string) {
  return tag
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatLongDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function postHref(id: string) {
  return `/posts/${id}`;
}

export function tagHref(tag: string) {
  return `/tags/${slugifyTag(tag)}`;
}
