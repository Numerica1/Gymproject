import Footer from "../../components/Footer";
import ClientPortal from "../../components/ClientPortal";
import Navbar from "../../components/Navbar";

export const metadata = {
  title: "My Package | Fitness Bhaktapur",
  description: "View your current Fitness Bhaktapur membership package.",
};

export default function ClientPage() {
  return (
    <>
      <Navbar />
      <main className="pageOffset">
        <ClientPortal />
      </main>
      <Footer />
    </>
  );
}
