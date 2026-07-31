import { Suspense } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ShopClientPortal from "../../components/ShopClientPortal";

export const metadata = {
  title: "My Shop Portal | Fitness Bhaktapur",
  description:
    "Track your orders, view your purchase history, and manage your shop profile at Fitness Bhaktapur.",
};

export default function ShopPortalPage() {
  return (
    <>
      <Navbar />
      <main className="pageOffset">
        <Suspense
          fallback={
            <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "#a1a1aa" }}>
              Loading your portal…
            </div>
          }
        >
          <ShopClientPortal />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
