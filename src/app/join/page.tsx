import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import JoinClient from "./JoinClient";

export const metadata = {
  title: "Join Gym & Register | Fitness Bhaktapur",
  description:
    "Register online for your Fitness Bhaktapur gym membership. Fill in your information and choose a secure payment method.",
};

export default function JoinPage() {
  return (
    <>
      <Navbar />
      <main className="pageOffset joinPageContainer" id="join-page-main">
        <JoinClient />
      </main>
      <Footer />
    </>
  );
}

