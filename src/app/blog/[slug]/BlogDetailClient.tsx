"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaCalendarDays, FaClock, FaEnvelope, FaLink, FaMagnifyingGlass, FaUser, FaXTwitter } from "react-icons/fa6";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { useGymBlogCategories, useGymBlogs } from "../../../data/gymData";
import type { BlogPost } from "../../../data/blogs";

interface BlogDetailClientProps { slug: string; fallbackPost: BlogPost | null; }

function NewsletterBar() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const subscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to subscribe.");
      setEmail(""); setMessage(data.message);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to subscribe."); }
    finally { setLoading(false); }
  };
  return <form className="articleNewsletter" onSubmit={subscribe}>
    <span className="articleNewsletterIcon"><FaEnvelope /></span><div className="articleNewsletterCopy"><strong>Subscribe to our newsletter</strong><span>Get the latest workout tips, fitness news, nutrition advice, exclusive offers and gym updates delivered to your inbox.</span></div><div className="articleNewsletterFields"><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setMessage(""); }} placeholder="Enter your email" aria-label="Email address" autoComplete="email" required disabled={loading} /><button type="submit" disabled={loading}>{loading ? "Subscribing..." : "Subscribe"}</button></div>{message && <p className="articleNewsletterMessage" role="status">{message}</p>}
  </form>;
}

export default function BlogDetailClient({ slug, fallbackPost }: BlogDetailClientProps) {
  const [blogs] = useGymBlogs();
  const [categories] = useGymBlogCategories();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const post = blogs.find((item) => item.slug === slug) || fallbackPost;
  const popularPosts = useMemo(() => blogs.filter((item) => item.slug !== slug && item.popular).slice(0, 4), [blogs, slug]);
  const relatedPosts = useMemo(() => blogs.filter((item) => item.slug !== slug).slice(0, 3), [blogs, slug]);
  const visibleCategories = useMemo(() => Array.from(new Set(categories.filter(Boolean))), [categories]);

  if (!mounted) return <div className="articleLoading">Loading article…</div>;
  if (!post) notFound();
  const paragraphs = Array.isArray(post.content) ? post.content : [post.content];

  return <article className="articlePage"><div className="articleLayout"><div className="articleMain">
    <header className="articleHeader"><nav className="articleBreadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>›</span><Link href="/blog">Blog</Link><span>›</span><strong>{post.title}</strong></nav><span className="articleCategory">{post.category}</span><h1>{post.title}</h1><div className="articleMeta"><span><FaCalendarDays /> {post.date}</span><span><FaClock /> {post.readTime}</span><span><FaUser /> By {post.author}</span></div></header>
    <div className="articleHeroImage"><Image src={post.image || "/images/pullup-training.jpg"} alt={post.title} fill priority sizes="(max-width: 850px) 100vw, 760px" /></div>
    <div className="articleBody"><p className="articleLead">{post.summary}</p>{paragraphs.filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    <div className="articleShare"><strong>Share this article</strong><div><button type="button" aria-label="Share on Facebook"><FaFacebookF /> Facebook</button><button type="button" aria-label="Share on Instagram"><FaInstagram /> Instagram</button><button type="button" aria-label="Share on X"><FaXTwitter /> X (Twitter)</button><button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)}><FaLink /> Copy Link</button></div></div>
    <div className="articleAuthor"><span>{post.author?.slice(0, 1).toUpperCase() || "F"}</span><div><small>About the author</small><h2>{post.author || "Fitness Bhaktapur Team"}</h2><p>Our team shares practical workout, nutrition and lifestyle guidance to help you train smarter and live healthier.</p></div></div>
    {relatedPosts.length > 0 && <section className="articleRelated"><h2>You May Also Like</h2><div>{relatedPosts.map((item) => <Link key={item.slug} href={`/blog/${item.slug}`}><span className="articleRelatedImage"><Image src={item.image || "/images/pullup-training.jpg"} alt={item.title} fill sizes="(max-width: 600px) 100vw, 250px" /><em>{item.category}</em></span><strong>{item.title}</strong><small>{item.date} · {item.readTime}</small></Link>)}</div></section>}
    <NewsletterBar />
  </div><aside className="articleSidebar">
    <section className="articleSearchBox"><h2>Search Articles</h2><label className="articleSearch"><input placeholder="Search articles..." aria-label="Search articles" /><FaMagnifyingGlass /></label></section>
    <section className="articleSidebarBox"><h2>Categories</h2>{visibleCategories.map((category) => <Link href="/blog" key={category}><span>{category}</span><small>{blogs.filter((item) => item.category.toLowerCase() === category.toLowerCase()).length}</small></Link>)}</section>
    <section className="articleSidebarBox"><h2>Popular Posts</h2>{popularPosts.length ? <div className="articlePopularList">{popularPosts.map((item) => <Link href={`/blog/${item.slug}`} key={item.slug}><Image src={item.image || "/images/pullup-training.jpg"} alt="" width={74} height={54} /><span><strong>{item.title}</strong><small>{item.date}</small></span></Link>)}</div> : <p>Popular posts will appear here.</p>}</section>
    <div className="articleCta"><div><strong>Ready to transform your body?</strong><p>Join Fitness Bhaktapur and start your fitness journey with us.</p><Link href="/join">Join Now</Link></div></div>
  </aside></div></article>;
}
