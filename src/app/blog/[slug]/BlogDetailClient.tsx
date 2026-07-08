"use client";

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { useGymBlogs } from "../../../data/gymData";
import type { BlogPost } from "../../../data/blogs";

interface BlogDetailClientProps {
  slug: string;
  fallbackPost: BlogPost | null;
}

export default function BlogDetailClient({ slug, fallbackPost }: BlogDetailClientProps) {
  const [blogs] = useGymBlogs();
  const [mounted, setMounted] = useState(false);

  // Mark as mounted after client-side hydration so localStorage data is available
  useEffect(() => {
    setMounted(true);
  }, []);

  // Try to find the post in the dynamic list first
  const dynamicPost = blogs.find((p) => p.slug === slug);
  const post = dynamicPost || fallbackPost;

  // Show a loading skeleton while waiting for client-side data to hydrate
  if (!mounted) {
    return (
      <div className="blogDetailArticle" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--clr-muted, #aaa)" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Loading…</div>
        </div>
      </div>
    );
  }

  // Only call notFound after mount — data has had a chance to load from localStorage
  if (!post) {
    notFound();
  }

  return (
    <article className="blogDetailArticle">
      {/* Header Metadata */}
      <header className="blogDetailHeader">
        <h1>{post.title}</h1>
        <div className="blogDetailMeta">
          <span>By {post.author}</span>
          <span className="separator">•</span>
          <span>{post.date}</span>
          <span className="separator">•</span>
          <span>{post.category}</span>
          <span className="separator">•</span>
          <span>{post.readTime}</span>
        </div>
      </header>

      {/* Featured Image */}
      <div className="blogDetailImageWrapper">
        <Image
          src={post.image || "/images/fitness-logo.jpg"}
          alt={post.title}
          className="blogDetailImage"
          width={1080}
          height={600}
          sizes="(max-width: 768px) 100vw, 1024px"
          priority
        />
      </div>

      {/* Article Text Content */}
      <div className="blogDetailBody">
        {Array.isArray(post.content) ? (
          post.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))
        ) : (
          <p>{post.content}</p>
        )}
      </div>

      {/* Footer Back Button */}
      <footer className="blogDetailFooter">
        <Link href="/blog" className="backToBlogsLink">
          <FaArrowLeft /> Back to Blogs
        </Link>
      </footer>
    </article>
  );
}
