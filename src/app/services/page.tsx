import Navbar from "../../components/Navbar";
import Features from "../../components/Features";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Our Programs & Classes | Fitness Bhaktapur",
  description:
    "Explore our wide range of premium fitness programs, strength training, yoga, cardio, and CrossFit in Bhaktapur, Nepal.",
};

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="pageOffset" id="services-page-main">
        <Features isPageHeader={true} />
      </main>
      <Footer />
    </>
  );
}

