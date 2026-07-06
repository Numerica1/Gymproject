"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import { useGymBlogs } from "../../../data/gymData";
import type { BlogPost } from "../../../data/blogs";

interface BlogDetailClientProps {
  slug: string;
  fallbackPost: BlogPost | null;
}

export default function BlogDetailClient({ slug, fallbackPost }: BlogDetailClientProps) {
  const [blogs] = useGymBlogs();

  // Try to find the post in the dynamic list first
  const dynamicPost = blogs.find((p) => p.slug === slug);
  const post = dynamicPost || fallbackPost;

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
        <img src={post.image || "/images/fitness-logo.jpg"} alt={post.title} className="blogDetailImage" />
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
