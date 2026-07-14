import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AboutTrainers from "../../components/AboutTrainers";
import AboutPageContent from "../../components/AboutPageContent";

export const metadata = {
  title: "About Us | Fitness Bhaktapur",
  description: "Learn about the mission, values, and expert team behind Fitness Bhaktapur gym in Nepal.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="simplePage" id="about-page-main">
        <AboutPageContent />
        <AboutTrainers />
      </main>
      <Footer />
    </>
  );
}
