import Navbar from "../../components/Navbar";
import CTA from "../../components/CTA";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Contact Us | Fitness Bhaktapur",
  description:
    "Get in touch with Fitness Bhaktapur. Call us, send an email, or visit our state-of-the-art gym in Bhaktapur, Nepal.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pageOffset" id="contact-page-main">
        <CTA isPageHeader={true} />
      </main>
      <Footer />
    </>
  );
}
