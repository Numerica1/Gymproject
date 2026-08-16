import CTA from "../components/CTA";
import Features from "../components/Features";
import Gallery from "../components/Gallery";
import Hero from "../components/Hero";
import Membership from "../components/Membership";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Testimonials from "../components/Testimonials";
import WhyChooseUs from "../components/WhyChooseUs";
import MembershipPopup from "../components/MembershipPopup";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="homeMain">
        <Hero />
        <Features />
        <Gallery />
        <WhyChooseUs />
        <Membership />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
      <MembershipPopup />
    </>
  );
}
