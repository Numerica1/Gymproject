import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import BlogDetailClient from "./BlogDetailClient";

// Force dynamic rendering — blog posts are stored in the backend/localStorage, not statically
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for web crawler SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  // Provide a generic metadata title — full details are loaded client-side
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: `${title} | Fitness Bhaktapur Blog`,
    description: "Read the latest fitness tips and advice from Fitness Bhaktapur.",
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <>
      <Navbar />

      <main className="blogDetailContainer" id={`blog-post-page-${slug}`}>
        <BlogDetailClient slug={slug} fallbackPost={null} />
      </main>

      <Footer />
    </>
  );
}
