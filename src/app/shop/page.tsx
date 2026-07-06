import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import ShopClient from "../../components/ShopClient";

export const metadata = {
  title: "Gym Shop | Fitness Bhaktapur",
  description:
    "Buy proteins, supplements, and gym essentials from Fitness Bhaktapur.",
};

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <main className="pageOffset" id="shop-page-main">
        <ShopClient />
      </main>
      <Footer />
    </>
  );
}
