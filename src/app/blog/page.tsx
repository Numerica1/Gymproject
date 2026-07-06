import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BlogContent from "./BlogContent";

export const metadata = {
  title: "Fitness Blog & Advice | Fitness Bhaktapur",
  description:
    "Read the latest fitness tips, nutrition guides, and wellness articles from the professional coaches at Fitness Bhaktapur in Nepal.",
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="pageOffset blogPageContainer" id="blog-page-main">
        <BlogContent />
      </main>
      <Footer />
    </>
  );
}

