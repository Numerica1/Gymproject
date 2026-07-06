import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { blogPosts } from "../../../data/blogs";
import BlogDetailClient from "./BlogDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Pre-render blog detail routes at build time
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate dynamic metadata for web crawler SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) {
    return {
      title: "Blog Post | Fitness Bhaktapur",
      description: "Read the latest fitness tips and advice from Fitness Bhaktapur.",
    };
  }

  return {
    title: `${post.title} | Fitness Bhaktapur Blog`,
    description: post.summary,
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug) || null;

  return (
    <>
      <Navbar />

      <main className="blogDetailContainer" id={`blog-post-page-${slug}`}>
        <BlogDetailClient slug={slug} fallbackPost={post} />
      </main>

      <Footer />
    </>
  );
}
