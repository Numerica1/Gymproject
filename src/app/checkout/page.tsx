import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Secure Checkout | Fitness Bhaktapur",
  description:
    "Complete your membership registration secure payment process online at Fitness Bhaktapur gym.",
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="pageOffset checkoutPageContainer" id="checkout-page-main">
        <CheckoutClient />
      </main>
      <Footer />
    </>
  );
}
