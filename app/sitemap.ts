import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smartrivals.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { url: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
    { url: `${BASE}/`,               changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/daily`,          changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/multiplayer`,    changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/leaderboard`,    changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/types`,          changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/cgu`,            changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/confidentialite`,changeFrequency: "yearly",  priority: 0.2 },
  ];
  return routes.map((r) => ({ ...r, lastModified: now }));
}
