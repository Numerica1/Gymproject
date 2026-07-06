import Navbar from "../../components/Navbar";
import Gallery from "../../components/Gallery";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Photo Gallery | Fitness Bhaktapur",
  description:
    "Take a virtual tour inside Fitness Bhaktapur. View our state-of-the-art facility, weights area, and training spaces.",
};

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main className="pageOffset" id="gallery-page-main">
        <Gallery isPageHeader={true} />
      </main>
      <Footer />
    </>
  );
}

