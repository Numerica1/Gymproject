import Footer from "../../../components/Footer";
import ShopBrandsClient from "../../../components/ShopBrandsClient";

export const metadata = {
  title: "Shop Brands | FitnessHealth",
  description:
    "Explore FitnessHealth supplement brands, descriptions, and product collections.",
};

export default function ShopBrandsPage() {
  return (
    <>
      <main id="shop-brands-page-main">
        <ShopBrandsClient />
      </main>
      <Footer />
    </>
  );
}
