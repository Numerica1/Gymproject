"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FaArrowRight, FaCalendarDays, FaClock, FaDumbbell, FaEnvelope, FaMagnifyingGlass, FaSeedling, FaUtensils, FaUsers } from "react-icons/fa6";
import { useGymBlogCategories, useGymBlogs } from "../../data/gymData";

const categoryIcons: Record<string, typeof FaDumbbell> = { Workout: FaDumbbell, Nutrition: FaUtensils, Lifestyle: FaUsers, News: FaSeedling };

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

export default function BlogContent() {
  const [blogs] = useGymBlogs();
  const [configuredCategories] = useGymBlogCategories();
  const categories = useMemo(() => ["All", ...Array.from(new Set(configuredCategories.map((category) => category.trim()).filter(Boolean)))], [configuredCategories]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [subscriptionState, setSubscriptionState] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const filteredPosts = useMemo(() => blogs.filter((post) => {
    const query = search.trim().toLowerCase();
    return (activeCategory === "All" || post.category.toLowerCase() === activeCategory.toLowerCase()) && (!query || [post.title, post.summary, post.category].some((value) => value.toLowerCase().includes(query)));
  }), [activeCategory, blogs, search]);
  const categoryCounts = useMemo(() => Object.fromEntries(categories.slice(1).map((category) => [category, blogs.filter((post) => post.category.toLowerCase() === category.toLowerCase()).length])) as Record<string, number>, [blogs, categories]);
  const popularPosts = blogs.filter((post) => post.popular).slice(0, 3);

  return <section className="fitnessBlog">
    <div className="fitnessBlogHero"><div className="fitnessBlogShell fitnessBlogHeroInner">
      <div className="fitnessBlogIntro"><span className="fitnessBlogEyebrow">Our blog</span><h1>Gym Tips, News &amp;<br />Fitness Insights</h1><p>Stay updated with the latest fitness tips, expert advice, workout guides and nutrition tips to help you achieve your goals.</p></div>
      <form className="fitnessNewsletter" onSubmit={async (event) => { event.preventDefault(); if (isSubscribing) return; setSubscriptionState(null); setIsSubscribing(true); try { const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "We couldn’t subscribe you right now."); setSubscriptionState({ type: "success", message: data.message }); setEmail(""); } catch (error) { setSubscriptionState({ type: "error", message: error instanceof Error ? error.message : "We couldn’t subscribe you right now." }); } finally { setIsSubscribing(false); } }}><div className="fitnessNewsletterTitle"><span className="fitnessMailIcon"><FaEnvelope /></span><div><strong>Subscribe to our newsletter</strong><p>Get the latest updates and fitness tips delivered to your inbox.</p></div></div><div className="fitnessSubscribeFields"><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSubscriptionState(null); }} placeholder="Enter your email" aria-label="Email address" autoComplete="email" required disabled={isSubscribing} /><button type="submit" disabled={isSubscribing}>{isSubscribing ? "Subscribing..." : "Subscribe"}</button></div>{subscriptionState && <p className={`fitnessSubscriptionMessage ${subscriptionState.type}`} role="status">{subscriptionState.message}</p>}</form>
    </div></div>
    <div className="fitnessBlogShell fitnessBlogBody"><div className="fitnessBlogMain">
      <div className="fitnessBlogToolbar"><h2>All Articles</h2><div className="fitnessCategoryTabs" aria-label="Blog categories">{categories.map((category) => <button key={category} type="button" className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</div></div>
      {filteredPosts.length ? <div className="fitnessArticleGrid">{filteredPosts.map((post) => <article className="fitnessArticleCard" key={post.slug || post.title}><Link href={`/blog/${post.slug}`} className="fitnessArticleImage" aria-label={`Read ${post.title}`}><Image src={post.image} alt={post.title} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw" /><span>{post.category}</span></Link><div className="fitnessArticleContent"><h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.summary}</p><div className="fitnessArticleMeta"><span><FaCalendarDays /> {formatDate(post.date)}</span><span><FaClock /> {post.readTime}</span></div></div></article>)}</div> : <div className="fitnessBlogEmpty"><h3>No articles found</h3><p>{blogs.length ? "Try another category or search term." : "New fitness articles are coming soon."}</p></div>}
    </div><aside className="fitnessBlogSidebar">
      <label className="fitnessSearch"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles..." aria-label="Search articles" /><FaMagnifyingGlass /></label>
      <div className="fitnessSidebarBlock"><h2>Categories</h2>{categories.slice(1).map((category) => { const Icon = categoryIcons[category] || FaDumbbell; return <button type="button" key={category} onClick={() => setActiveCategory(category)}><span><Icon /> {category}</span><small>{categoryCounts[category]}</small></button>; })}</div>
      <div className="fitnessSidebarBlock"><h2>Popular Posts</h2>{popularPosts.length ? <div className="fitnessPopularPosts">{popularPosts.map((post) => <Link href={`/blog/${post.slug}`} key={post.slug || post.title}><Image src={post.image} alt="" width={68} height={52} /><span><strong>{post.title}</strong><small>{formatDate(post.date)}</small></span></Link>)}</div> : <p className="fitnessSidebarHint">Featured posts will appear here.</p>}<button type="button" className="fitnessViewPosts" onClick={() => { setActiveCategory("All"); setSearch(""); }}>View All Posts <FaArrowRight /></button></div>
    </aside></div>
  </section>;
}
