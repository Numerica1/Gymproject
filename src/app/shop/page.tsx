import Footer from "../../components/Footer";
import ShopClient from "../../components/ShopClient";
import { Suspense } from "react";

export const metadata = {
  title: "Gym Shop | Fitness Bhaktapur",
  description:
    "Buy proteins, supplements, and gym essentials from Fitness Bhaktapur.",
};

export default function ShopPage() {
  return (
    <>
      <main id="shop-page-main">
        <Suspense fallback={<div className="loadingContainer">Loading shop...</div>}>
          <ShopClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
