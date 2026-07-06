"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useGymBlogs } from "../../data/gymData";

export default function BlogContent() {
  const [blogs] = useGymBlogs();

  return (
    <section className="section blogListingSection">
      <h1 className="blogPageHeading">OUR BLOGS</h1>

      <div className="blogGrid">
        {blogs.map((post, idx) => (
          <motion.article
            className="blogCard"
            key={post.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
          >
            <div className="blogImageWrapper">
              <img src={post.image} alt={post.title} className="blogImage" />
            </div>
            <div className="blogContent">
              <h3>{post.title}</h3>
              <p className="blogDate">{post.date}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="blogReadLink"
                id={`blog-read-link-${idx}`}
              >
                Read More »
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
