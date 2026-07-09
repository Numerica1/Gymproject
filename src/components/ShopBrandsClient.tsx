"use client";

import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaBoxesStacked } from "react-icons/fa6";
import { useGymBrands, useGymProducts } from "../data/gymData";

export default function ShopBrandsClient() {
  const [brands] = useGymBrands();
  const [products] = useGymProducts();
  const activeBrands = brands.filter((brand) => brand.status === "Active");

  return (
    <section className="shopBrandsPage">
      <header className="shopBrandsHero">
        <Link href="/shop" className="shopBrandsBack">
          <FaArrowLeft /> Back to Shop
        </Link>
        <p>FitnessHealth Brands</p>
        <h1>Explore Our Supplement Partners</h1>
        <span>
          Browse trusted nutrition brands available at FitnessHealth, with short
          descriptions and product counts for quick discovery.
        </span>
      </header>

      <div className="shopBrandsOverviewGrid">
        {activeBrands.map((brand) => {
          const brandProducts = products.filter(
            (product) => product.status === "Active" && product.brandKey === brand.key
          );

          return (
            <article className="shopBrandOverviewCard" key={brand.key}>
              <div
                className="shopBrandOverviewBanner"
                style={{ backgroundImage: `url(${brand.banner || "/images/equipment-row.jpg"})` }}
              >
                <div className="shopBrandOverviewLogo">
                  {brand.logo ? (
                    <Image src={brand.logo} alt={brand.name} width={86} height={86} unoptimized />
                  ) : (
                    <span>{brand.name.slice(0, 2)}</span>
                  )}
                </div>
              </div>
              <div className="shopBrandOverviewBody">
                <div>
                  <h2>{brand.name}</h2>
                  <p>{brand.description || "A trusted FitnessHealth supplement brand for everyday training, wellness, and recovery needs."}</p>
                </div>
                <div className="shopBrandOverviewMeta">
                  <span><FaBoxesStacked /> {brandProducts.length} products</span>
                  <Link href={`/shop?brand=${brand.key}`}>View Collection</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
