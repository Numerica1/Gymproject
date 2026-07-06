import Footer from "../../components/Footer";
import ClientLogin from "../../components/ClientLogin";
import Navbar from "../../components/Navbar";

export const metadata = {
  title: "Client Login | Fitness Bhaktapur",
  description: "Login to view your Fitness Bhaktapur membership package.",
};

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="pageOffset">
        <ClientLogin />
      </main>
      <Footer />
    </>
  );
}
