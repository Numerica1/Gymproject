import type { MetadataRoute } from "next";
import { blogPosts } from "../data/blogs";
import { programs } from "../data/programs";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fitnessbhaktapur.com";
  const now = new Date();

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/gallery",
    "/membership",
    "/shop",
    "/blog",
    "/contact",
    "/trainers",
    "/join",
    "/privacy",
    "/terms",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...programs.map((program) => ({
      url: `${siteUrl}/programs/${program.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
