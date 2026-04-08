import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ncc-chiro.or.jp";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/greeting`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/activities`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/membership`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/membership-types`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/apply`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/columns`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/news`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/tokushoho`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const { data: columns } = await supabase
    .from("columns")
    .select("slug, updated_at, no_index")
    .eq("is_published", true)
    .eq("is_member_only", false);

  const columnPages: MetadataRoute.Sitemap = (columns ?? [])
    .filter((c) => !c.no_index)
    .map((c) => ({
      url: `${SITE_URL}/columns/${c.slug}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const { data: news } = await supabase
    .from("news")
    .select("id, updated_at")
    .eq("is_published", true)
    .eq("is_member_only", false);

  const newsPages: MetadataRoute.Sitemap = (news ?? []).map((n) => ({
    url: `${SITE_URL}/news/${n.id}`,
    lastModified: new Date(n.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...columnPages, ...newsPages];
}
